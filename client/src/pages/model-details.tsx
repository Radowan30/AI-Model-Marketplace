import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle, Clock, Download, MessageSquare, Shield, Star, Lock, Activity, FileText, Unlock, Eye, Users, TrendingUp, BarChart, Mail, ExternalLink, Loader2 } from "lucide-react";
import { useRoute } from "wouter";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchModelFiles, checkFileAccess, downloadFile, formatFileSize } from "@/lib/file-upload";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity-logger";
import { ApiSpecRenderer } from "@/components/ApiSpecRenderer";
import { fetchModelById } from "@/lib/api";

export default function ModelDetailsPage() {
  const [match, params] = useRoute("/model/:id");
  const modelId = params?.id;
  const { toast } = useToast();
  const { user, userProfile, currentRole } = useAuth();

  // Model state
  const [model, setModel] = useState<any>(null);
  const [loadingModel, setLoadingModel] = useState(true);

  // Discussions state
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [loadingDiscussions, setLoadingDiscussions] = useState(true);

  const [subscriptionStatus, setSubscriptionStatus] = useState<'none' | 'active'>('none');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  // Discussion modal state
  const [showDiscussionModal, setShowDiscussionModal] = useState(false);
  const [discussionTitle, setDiscussionTitle] = useState("");
  const [discussionContent, setDiscussionContent] = useState("");

  // Comment state - track which discussion has active comment form
  const [activeCommentForm, setActiveCommentForm] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState<{[key: string]: string}>({});

  // Files state
  const [modelFiles, setModelFiles] = useState<any[]>([]);
  const [hasFileAccess, setHasFileAccess] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);

  // Fetch model data
  useEffect(() => {
    const loadModel = async () => {
      if (!modelId) return;

      try {
        setLoadingModel(true);
        const modelData = await fetchModelById(modelId);
        setModel(modelData);
      } catch (error) {
        console.error('Error loading model:', error);
        toast({
          title: "Error",
          description: "Failed to load model details.",
          variant: "destructive"
        });
      } finally {
        setLoadingModel(false);
      }
    };

    loadModel();
  }, [modelId, toast]);

  // Check subscription status from database
  useEffect(() => {
    const checkSubscription = async () => {
      if (!modelId || !user) {
        setSubscriptionStatus('none');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('status')
          .eq('model_id', modelId)
          .eq('buyer_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data && data.status === 'active') {
          setSubscriptionStatus('active');
        } else {
          setSubscriptionStatus('none');
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        setSubscriptionStatus('none');
      }
    };

    checkSubscription();
  }, [modelId, user]);

  // Check file access and load files based on subscription status
  useEffect(() => {
    const checkAccessAndLoadFiles = async () => {
      // Wait for model to load
      if (!modelId || !model) {
        setLoadingFiles(false);
        return;
      }

      setLoadingFiles(true);

      // CRITICAL ACCESS CONTROL:
      // File access is ONLY granted to buyers with active subscriptions
      // Publishers should NOT have access on the public model details page

      if (!user) {
        // Not logged in = no access
        setHasFileAccess(false);
        setModelFiles([]);
        setLoadingFiles(false);
        return;
      }

      // Check if current user is the publisher of THIS specific model
      const isModelPublisher = model.publisherId === user.id;

      if (isModelPublisher) {
        // Publisher of this model = no access on public view
        setHasFileAccess(false);
        setModelFiles([]);
        setLoadingFiles(false);
        return;
      }

      // For non-publishers (buyers), use subscriptionStatus state
      // subscriptionStatus is already fetched by the subscription check useEffect
      const hasActiveSubscription = subscriptionStatus === 'active';
      setHasFileAccess(hasActiveSubscription);

      // Fetch files only if user has access
      if (hasActiveSubscription) {
        try {
          const files = await fetchModelFiles(modelId);
          setModelFiles(files);
        } catch (fileError: any) {
          console.error('Error loading files:', fileError);
          // Don't revoke access if file fetch fails, but clear files
          setModelFiles([]);
          toast({
            title: "Error loading file list",
            description: "Could not load files, but you have access.",
            variant: "destructive",
          });
        }
      } else {
        // No access = clear files
        setModelFiles([]);
      }

      setLoadingFiles(false);
    };

    checkAccessAndLoadFiles();
  }, [modelId, user, model, subscriptionStatus]);

  // Track page view
  useEffect(() => {
    const trackView = async () => {
      if (!modelId) return;

      try {
        // Check if already viewed in this session
        const viewedModels = JSON.parse(sessionStorage.getItem('viewedModels') || '[]');

        if (viewedModels.includes(modelId)) {
          // Already viewed in this session, skip tracking
          return;
        }

        // Track view in database
        const { error: viewError } = await supabase
          .from('views')
          .insert({
            model_id: modelId,
            user_id: user?.id || null,
            timestamp: new Date().toISOString()
          });

        if (viewError) {
          console.error('Error tracking view:', viewError);
          // Don't show error to user, just log it
          return;
        }

        // Increment view count on model (using RPC function to avoid race conditions)
        const { error: updateError } = await supabase.rpc('increment_model_views', {
          model_id: modelId
        });

        if (updateError) {
          console.error('Error incrementing view count:', updateError);
        }

        // Mark as viewed in session
        viewedModels.push(modelId);
        sessionStorage.setItem('viewedModels', JSON.stringify(viewedModels));
      } catch (error) {
        console.error('Error in view tracking:', error);
      }
    };

    trackView();
  }, [modelId, user]);

  // Fetch discussions
  useEffect(() => {
    const loadDiscussions = async () => {
      if (!modelId) return;

      try {
        setLoadingDiscussions(true);
        const { data, error } = await supabase
          .from('discussions')
          .select(`
            *,
            profiles!discussions_user_id_fkey (
              name
            ),
            discussion_replies (
              id,
              content,
              created_at,
              user_id,
              profiles!discussion_replies_user_id_fkey (
                name
              )
            )
          `)
          .eq('model_id', modelId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform to expected format
        const transformedDiscussions = data?.map(disc => ({
          id: disc.id,
          modelId: disc.model_id,
          userId: disc.user_id,
          userName: disc.profiles?.name || 'Unknown User',
          content: disc.content,
          date: new Date(disc.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          replies: disc.discussion_replies?.map((reply: any) => ({
            id: reply.id,
            modelId: modelId,
            userId: reply.user_id,
            userName: reply.profiles?.name || 'Unknown User',
            content: reply.content,
            date: new Date(reply.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
          })) || []
        })) || [];

        setDiscussions(transformedDiscussions);
      } catch (error) {
        console.error('Error loading discussions:', error);
      } finally {
        setLoadingDiscussions(false);
      }
    };

    loadDiscussions();
  }, [modelId]);

  if (!model) return <div className="p-8 text-center">
    {loadingModel ? 'Loading...' : 'Model not found'}
  </div>;

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to subscribe.",
        variant: "destructive",
      });
      return;
    }

    if (model.price === "free") {
      try {
        // Create subscription in database
        const { error } = await supabase
          .from('subscriptions')
          .insert({
            buyer_id: user.id,
            model_id: modelId,
            status: 'active',
            approved_at: new Date().toISOString()
          });

        if (error) {
          // Check if already subscribed
          if (error.code === '23505') {
            toast({
              title: "Already Subscribed",
              description: "You are already subscribed to this model.",
              variant: "default",
            });
            // Update subscription status - file access useEffect will handle the rest
            setSubscriptionStatus('active');
            return;
          }
          throw error;
        }

        // Update local state - file access useEffect will handle the rest
        setSubscriptionStatus('active');

        // Log activity
        await logActivity({
          userId: user.id,
          activityType: 'subscribed',
          title: `Subscribed to ${model.name}`,
          description: 'Free subscription',
          modelId: modelId,
          modelName: model.name
        });

        toast({
          title: `Successfully subscribed to ${model.name}!`,
          description: "You now have access to model files and documentation.",
        });
      } catch (error) {
        console.error('Error subscribing:', error);
        toast({
          title: "Subscription Failed",
          description: "Failed to create subscription. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      // Paid model - show unavailable message
      toast({
        title: "Paid Subscription Unavailable",
        description: "Payment method coming soon.",
        variant: "default",
      });
    }
  };

  const handleUnsubscribe = async () => {
    if (!user || !modelId) return;

    try {
      // Find the subscription
      const { data: subscription, error: findError } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('model_id', modelId)
        .eq('buyer_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (findError) throw findError;

      if (!subscription) {
        toast({
          title: "Not Subscribed",
          description: "You are not currently subscribed to this model.",
          variant: "destructive",
        });
        return;
      }

      // Cancel the subscription
      const { error: cancelError } = await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', subscription.id);

      if (cancelError) throw cancelError;

      // Update local state - file access useEffect will handle the rest
      setSubscriptionStatus('none');

      // Log activity
      await logActivity({
        userId: user.id,
        activityType: 'unsubscribed',
        title: `Unsubscribed from ${model.name}`,
        description: 'Cancelled subscription',
        modelId: modelId,
        modelName: model.name
      });

      toast({
        title: "Successfully Unsubscribed",
        description: `You have unsubscribed from ${model.name}.`,
      });
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast({
        title: "Unsubscribe Failed",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isPublisher = currentRole === 'publisher';

  const handleBack = () => {
    window.history.back();
  };

  const handleDownloadFile = async (file: any) => {
    if (!modelId || !user) return;

    try {
      setDownloadingFileId(file.id);

      // Download file with signed URL
      await downloadFile(file.id, file.file_path, file.file_name, modelId, user?.id || null);

      // Log download activity
      await logActivity({
        userId: user.id,
        activityType: 'downloaded',
        title: `Downloaded file from ${model.name}`,
        description: `File: ${file.file_name}`,
        modelId: modelId,
        modelName: model.name,
        metadata: {
          fileName: file.file_name,
          fileSize: file.file_size,
          fileType: 'upload'
        }
      });

      toast({
        title: "Download Started",
        description: `Downloading ${file.file_name}...`,
      });
    } catch (error: any) {
      console.error('Error downloading file:', error);
      toast({
        title: "Download Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDownloadingFileId(null);
    }
  };

  const handleRatingSubmit = async () => {
    if (selectedRating === 0) {
      toast({
        title: "Select a Rating",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to rate models.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Store old rating for comparison
      const oldAverageRating = model.average_rating || 0;

      // Upsert rating (insert or update if exists)
      const { error: ratingError } = await supabase
        .from('ratings')
        .upsert({
          model_id: modelId,
          user_id: user.id,
          rating_value: selectedRating,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'model_id,user_id'
        });

      if (ratingError) throw ratingError;

      // Fetch all ratings for this model to recalculate average
      const { data: allRatings, error: fetchError } = await supabase
        .from('ratings')
        .select('rating_value')
        .eq('model_id', modelId);

      if (fetchError) throw fetchError;

      // Calculate new average
      const totalRatings = allRatings?.length || 0;
      const sumRatings = allRatings?.reduce((sum, r) => sum + r.rating_value, 0) || 0;
      const newAverageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

      // Update model with new average rating
      const { error: updateError } = await supabase
        .from('models')
        .update({
          average_rating: newAverageRating,
          total_rating_count: totalRatings
        })
        .eq('id', modelId);

      if (updateError) throw updateError;

      // Update local model state
      setModel((prev: any) => ({
        ...prev,
        average_rating: newAverageRating,
        total_rating_count: totalRatings
      }));

      // Log activity
      await logActivity({
        userId: user.id,
        activityType: 'rated',
        title: `Rated ${model.name}`,
        description: `Gave ${selectedRating} star${selectedRating !== 1 ? 's' : ''}`,
        modelId: modelId,
        modelName: model.name,
        metadata: {
          rating: selectedRating,
          oldAverage: oldAverageRating,
          newAverage: newAverageRating
        }
      });

      toast({
        title: "Rating Submitted",
        description: `You rated this model ${selectedRating} out of 5 stars.`,
      });

      setShowRatingModal(false);
      setSelectedRating(0);
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Rating Failed",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateDiscussion = async () => {
    if (!discussionTitle.trim() || !discussionContent.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both title and description.",
        variant: "destructive",
      });
      return;
    }

    if (discussionTitle.length > 100) {
      toast({
        title: "Title Too Long",
        description: "Title must be 100 characters or less.",
        variant: "destructive",
      });
      return;
    }

    if (discussionContent.length > 2000) {
      toast({
        title: "Content Too Long",
        description: "Description must be 2000 characters or less.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Insert into database
      const { data, error } = await supabase
        .from('discussions')
        .insert({
          model_id: modelId,
          user_id: user?.id,
          content: `**${discussionTitle}**\n\n${discussionContent}`
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      const newDiscussion = {
        id: data.id,
        modelId: modelId,
        userId: user?.id || '',
        userName: userProfile?.name || 'User',
        content: `**${discussionTitle}**\n\n${discussionContent}`,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        replies: [],
      };

      setDiscussions(prev => [newDiscussion, ...prev]);

      // Log activity
      if (user) {
        await logActivity({
          userId: user.id,
          activityType: 'commented',
          title: `Posted discussion on ${model.name}`,
          description: discussionTitle,
          modelId: modelId,
          modelName: model.name
        });
      }

      toast({
        title: "Discussion Created",
        description: "Your discussion has been posted.",
      });

      setShowDiscussionModal(false);
      setDiscussionTitle("");
      setDiscussionContent("");
    } catch (error) {
      console.error('Error creating discussion:', error);
      toast({
        title: "Error",
        description: "Failed to create discussion.",
        variant: "destructive",
      });
    }
  };

  const handleAddComment = async (discussionId: string) => {
    const content = commentContent[discussionId]?.trim();

    if (!content) {
      toast({
        title: "Missing Content",
        description: "Please enter a comment.",
        variant: "destructive",
      });
      return;
    }

    if (content.length > 1000) {
      toast({
        title: "Comment Too Long",
        description: "Comment must be 1000 characters or less.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Insert reply into database
      const { data, error } = await supabase
        .from('discussion_replies')
        .insert({
          discussion_id: discussionId,
          user_id: user?.id,
          content: content
        })
        .select()
        .single();

      if (error) throw error;

      // Create new comment for local state
      const newComment = {
        id: data.id,
        modelId: modelId,
        userId: user?.id || '',
        userName: userProfile?.name || 'User',
        content: content,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      };

      // Update local state
      setDiscussions(prev => prev.map(disc => {
        if (disc.id === discussionId) {
          return {
            ...disc,
            replies: [...(disc.replies || []), newComment]
          };
        }
        return disc;
      }));

      // Log activity
      if (user) {
        await logActivity({
          userId: user.id,
          activityType: 'commented',
          title: `Replied to discussion on ${model.name}`,
          description: content.substring(0, 100),
          modelId: modelId,
          modelName: model.name
        });
      }

      toast({
        title: "Comment Added",
        description: "Your comment has been posted.",
      });

      // Clear comment form
      setCommentContent(prev => ({ ...prev, [discussionId]: "" }));
      setActiveCommentForm(null);
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout type="dashboard">
       <div className="max-w-5xl mx-auto space-y-8">
          <Button variant="ghost" className="gap-2 pl-0 hover:pl-2 transition-all" onClick={handleBack}>
             <ArrowLeft className="w-4 h-4" /> Back
          </Button>

          {/* Header */}
          <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
             <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                   {model.categories.map((category) => (
                     <Badge key={category.id}>{category.name}</Badge>
                   ))}
                   <span className="text-sm text-muted-foreground">Updated {model.updatedAt}</span>
                </div>
                <h1 className="text-4xl font-heading font-bold">{model.name}</h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                   {model.shortDescription}
                </p>
                <div className="flex items-center gap-4 pt-2">
                   <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                         <AvatarFallback>P</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{model.publisherName}</span>
                   </div>
                </div>
             </div>

             <Card className="w-full md:w-80 border-primary/20 bg-primary/5 shadow-lg">
                <CardContent className="p-6 space-y-6">
                   <div className="space-y-3">
                      <div className="flex justify-between items-center">
                         <span className="text-muted-foreground text-sm">Pricing</span>
                         {model.price === "free" ? (
                           <Badge className="bg-green-500 hover:bg-green-600 gap-1">
                             <Unlock className="w-3 h-3" />
                             FREE
                           </Badge>
                         ) : (
                           <Badge className="bg-primary gap-1">
                             <Lock className="w-3 h-3" />
                             MYR {model.priceAmount?.toFixed(2)}/month
                           </Badge>
                         )}
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-muted-foreground text-sm">Version</span>
                         <span className="font-mono text-sm">{model.version}</span>
                      </div>
                   </div>

                   <Separator className="bg-primary/10" />

                   {isPublisher ? (
                      <div className="text-center py-2">
                         <Button disabled className="w-full" variant="ghost">
                            Preview Only - Cannot Subscribe
                         </Button>
                         <p className="text-xs text-center text-muted-foreground mt-2">
                            Publishers can only preview models. Use a buyer account to subscribe.
                         </p>
                      </div>
                   ) : subscriptionStatus === 'active' ? (
                      <div className="space-y-2">
                         <div className="flex items-center justify-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-700">
                               {model.price === 'free' ? 'Active Subscription' : `Active (MYR ${model.priceAmount?.toFixed(2)}/month)`}
                            </span>
                         </div>
                         <Button
                            variant="outline"
                            className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={handleUnsubscribe}
                         >
                            Unsubscribe
                         </Button>
                      </div>
                   ) : (
                      <>
                         <Button className="w-full shadow-md" onClick={handleSubscribe}>
                            {model.price === 'free'
                              ? 'Subscribe for Free'
                              : `Subscribe (MYR ${model.priceAmount?.toFixed(2)}/mo)`}
                         </Button>
                         <p className="text-xs text-center text-muted-foreground">
                            By subscribing, you agree to the <a href="#" className="underline">Terms of Use</a>.
                         </p>
                      </>
                   )}
                </CardContent>
             </Card>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 p-4 sm:p-6 bg-card border border-border rounded-xl shadow-sm">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                   <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                   <p className="text-xs text-muted-foreground">Accuracy</p>
                   <p className="font-bold text-lg">{model.stats.accuracy}%</p>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                   <Clock className="w-5 h-5 text-green-600" />
                </div>
                <div>
                   <p className="text-xs text-muted-foreground">Response time</p>
                   <p className="font-bold text-lg">{model.stats.responseTime}ms</p>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                   <Star className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                   <p className="text-xs text-muted-foreground">Rating</p>
                   <div className="flex items-center gap-2">
                      <p className="font-bold text-lg">4.8/5</p>
                      {!isPublisher && (
                         <button
                            onClick={() => setShowRatingModal(true)}
                            className="text-xs text-primary hover:underline"
                         >
                            Rate
                         </button>
                      )}
                   </div>
                </div>
             </div>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="overview" className="w-full">
             <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
               <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-1 sm:gap-3 md:gap-6">
                  <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-2 sm:px-3 md:px-4 py-3 whitespace-nowrap text-sm sm:text-base">
                     Overview
                  </TabsTrigger>
                  <TabsTrigger value="docs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-2 sm:px-3 md:px-4 py-3 whitespace-nowrap text-sm sm:text-base">
                     Docs
                  </TabsTrigger>
                  <TabsTrigger value="files" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-2 sm:px-3 md:px-4 py-3 whitespace-nowrap text-sm sm:text-base">
                     Files
                  </TabsTrigger>
                  <TabsTrigger value="discussion" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-2 sm:px-3 md:px-4 py-3 whitespace-nowrap text-sm sm:text-base">
                     Discussion
                  </TabsTrigger>
                  <TabsTrigger value="stats" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-2 sm:px-3 md:px-4 py-3 whitespace-nowrap text-sm sm:text-base">
                     Stats
                  </TabsTrigger>
               </TabsList>
             </div>

             <TabsContent value="overview" className="py-6 space-y-6">
                <div>
                   <h3 className="text-xl font-bold mb-4">Key Features</h3>
                   <ul className="grid md:grid-cols-2 gap-3">
                      {model.features.map((feature, i) => (
                         <li key={i} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-primary" />
                            <span>{feature}</span>
                         </li>
                      ))}
                   </ul>
                </div>
                <div>
                   <h3 className="text-xl font-bold mb-4">Detailed Description</h3>
                   {model.detailedDescription ? (
                     <div className="prose max-w-none text-muted-foreground text-sm whitespace-pre-wrap">
                        {model.detailedDescription}
                     </div>
                   ) : (
                     <p className="text-muted-foreground text-sm italic">
                        No detailed description provided.
                     </p>
                   )}
                </div>

                {/* Model Details Section */}
                <div>
                   <h3 className="text-xl font-bold mb-4">Model Details</h3>
                   <div className="space-y-3 text-sm">
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                         <span className="text-muted-foreground font-medium sm:min-w-32 shrink-0">Creator:</span>
                         <a href={`mailto:${model.publisherEmail}`} className="text-primary hover:underline break-words">
                            {model.publisherName}
                         </a>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                         <span className="text-muted-foreground font-medium sm:min-w-32 shrink-0">Collaborators:</span>
                         <div className="break-words">
                            {model.collaborators && model.collaborators.length > 0 ? (
                               model.collaborators.map((collab, i) => (
                                  <span key={i}>
                                     <a href={`mailto:${collab}`} className="text-primary hover:underline">
                                        {collab}
                                     </a>
                                     {i < model.collaborators!.length - 1 && ', '}
                                  </span>
                               ))
                            ) : (
                               <span className="text-muted-foreground">No collaborators</span>
                            )}
                         </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                         <span className="text-muted-foreground font-medium sm:min-w-32 shrink-0">Published On:</span>
                         <span className="break-words">{new Date(model.publishedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                         <span className="text-muted-foreground font-medium sm:min-w-32 shrink-0">Last Update:</span>
                         <span className="break-words">{new Date(model.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                   </div>
                </div>

                {/* Access & Pricing Section */}
                <Card className="border-primary/20 bg-primary/5">
                   <CardHeader>
                      <CardTitle className="text-lg">Access & Pricing</CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                         {model.price === 'free' ? (
                            <>
                               <Badge className="bg-green-500 hover:bg-green-600 gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  Free Subscription
                               </Badge>
                               <span className="text-sm text-muted-foreground">
                                  Subscribe to access and download model files
                               </span>
                            </>
                         ) : (
                            <>
                               <Badge className="bg-primary gap-1">
                                  <Lock className="w-3 h-3" />
                                  Paid Subscription
                               </Badge>
                               <span className="text-sm font-semibold">
                                  MYR {model.priceAmount?.toFixed(2)}/month
                               </span>
                               <span className="text-sm text-muted-foreground">
                                  • Requires paid subscription
                               </span>
                            </>
                         )}
                      </div>
                   </CardContent>
                </Card>

                {/* Help & Support Section */}
                <div>
                   <h3 className="text-xl font-bold mb-4">Help & Support</h3>
                   <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => {
                         window.location.href = `mailto:${model.publisherEmail}?subject=Question about ${model.name}`;
                      }}
                   >
                      <Mail className="w-4 h-4" />
                      Contact Publisher
                   </Button>
                </div>
             </TabsContent>

             <TabsContent value="docs" className="py-6">
                <div className="space-y-4">
                   <h3 className="text-xl font-bold">API Documentation</h3>
                   {model.apiDocumentation ? (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-muted-foreground">Format:</span>
                          <Badge variant="outline" className="uppercase text-xs">
                            {model.apiSpecFormat || 'text'}
                          </Badge>
                        </div>
                        <div className="bg-secondary/20 p-6 rounded-lg border border-border">
                           <ApiSpecRenderer
                             content={model.apiDocumentation}
                             format={(model.apiSpecFormat as "json" | "yaml" | "markdown" | "text") || "text"}
                           />
                        </div>
                      </>
                   ) : (
                      <div className="flex flex-col items-center justify-center py-12 bg-secondary/20 rounded-lg border border-dashed border-border">
                         <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                         <h4 className="text-lg font-bold">No Documentation Available</h4>
                         <p className="text-muted-foreground">No documentation has been provided for this model yet.</p>
                      </div>
                   )}
                </div>
             </TabsContent>

             <TabsContent value="files" className="py-6">
                <div className="space-y-4">
                   {loadingFiles ? (
                      <div className="flex flex-col items-center justify-center py-12">
                         <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                         <p className="text-muted-foreground">Loading files...</p>
                      </div>
                   ) : !hasFileAccess ? (
                      <div className="flex flex-col items-center justify-center py-12 bg-secondary/20 rounded-lg border border-dashed border-border">
                         <Lock className="w-16 h-16 text-muted-foreground mb-4" />
                         <h3 className="text-lg font-bold">Access Restricted</h3>
                         <p className="text-muted-foreground mb-4 text-center max-w-md">
                            {isPublisher
                               ? "File access is only available for buyers with active subscriptions."
                               : "Subscribe to this model to access files and resources."}
                         </p>
                         {!isPublisher && (
                            <Button onClick={handleSubscribe}>Subscribe Now</Button>
                         )}
                      </div>
                   ) : modelFiles.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 bg-secondary/20 rounded-lg border border-dashed border-border">
                         <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                         <h3 className="text-lg font-bold">No Files Available</h3>
                         <p className="text-muted-foreground">No files have been uploaded for this model yet.</p>
                      </div>
                   ) : (
                      <>
                         <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Model Files ({modelFiles.length})</h3>
                            <Badge variant="secondary" className="gap-1">
                               <Unlock className="w-3 h-3" />
                               Access Granted
                            </Badge>
                         </div>

                         {modelFiles.map((file) => {
                            const isExternalUrl = file.file_type === 'url' || file.file_type === 'external_url';

                            return (
                            <Card key={file.id}>
                               <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                     <div className="p-2 bg-secondary rounded flex-shrink-0">
                                        {isExternalUrl ? (
                                           <ExternalLink className="w-5 h-5" />
                                        ) : (
                                           <FileText className="w-5 h-5" />
                                        )}
                                     </div>
                                     <div className="min-w-0 flex-1">
                                        <p className="font-medium truncate">{file.file_name}</p>
                                        <p className="text-xs text-muted-foreground">
                                           {file.file_size ? formatFileSize(file.file_size) : 'External URL'}
                                           {file.description && ` • ${file.description}`}
                                        </p>
                                        {isExternalUrl && (
                                           <a
                                              href={file.file_url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-xs text-blue-600 hover:text-blue-800 hover:underline truncate mt-1 max-w-md block break-all"
                                           >
                                              {file.file_url}
                                           </a>
                                        )}
                                     </div>
                                  </div>
                                  {!isExternalUrl && (
                                     <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full sm:w-auto flex-shrink-0 gap-2"
                                        onClick={() => handleDownloadFile(file)}
                                        disabled={downloadingFileId === file.id}
                                     >
                                        {downloadingFileId === file.id ? (
                                           <>
                                              <Loader2 className="w-4 h-4 animate-spin" />
                                              Downloading...
                                           </>
                                        ) : (
                                           <>
                                              <Download className="w-4 h-4" /> Download
                                           </>
                                        )}
                                     </Button>
                                  )}
                               </CardContent>
                            </Card>
                            );
                         })}
                      </>
                   )}
                </div>
             </TabsContent>

             <TabsContent value="discussion" className="py-6">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-lg font-bold">Community Discussion</h3>
                   <Button variant="outline" size="sm" onClick={() => setShowDiscussionModal(true)}>
                      + Start Discussion
                   </Button>
                </div>

                <div className="space-y-6">
                   {discussions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 bg-secondary/20 rounded-lg border border-dashed border-border">
                         <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
                         <h4 className="text-lg font-bold">No discussions yet</h4>
                         <p className="text-muted-foreground mb-4">Be the first to start a discussion</p>
                         <Button variant="outline" onClick={() => setShowDiscussionModal(true)}>
                            + Start Discussion
                         </Button>
                      </div>
                   ) : (
                      discussions.map(discussion => (
                         <Card key={discussion.id}>
                            <CardHeader className="p-4 bg-secondary/10">
                               <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                     <Avatar className="w-6 h-6">
                                        <AvatarFallback>{discussion.userName[0]}</AvatarFallback>
                                     </Avatar>
                                     <span className="font-medium text-sm">{discussion.userName}</span>
                                  </div>
                                  <span className="text-xs text-muted-foreground">{discussion.date}</span>
                               </div>
                            </CardHeader>
                            <CardContent className="p-4">
                               <p className="text-sm whitespace-pre-wrap">{discussion.content}</p>

                               {/* Replies */}
                               {discussion.replies && discussion.replies.length > 0 && (
                                  <div className="mt-4 pl-4 border-l-2 border-border space-y-4">
                                     {discussion.replies.map(reply => (
                                        <div key={reply.id}>
                                           <div className="flex items-center gap-2 mb-1">
                                              <span className="font-bold text-xs text-primary">{reply.userName}</span>
                                              <span className="text-xs text-muted-foreground">{reply.date}</span>
                                           </div>
                                           <p className="text-sm">{reply.content}</p>
                                        </div>
                                     ))}
                                  </div>
                               )}

                               {/* Comment Form */}
                               <div className="mt-4">
                                  {activeCommentForm === discussion.id ? (
                                     <div className="space-y-3">
                                        <Textarea
                                           placeholder="Add a comment..."
                                           value={commentContent[discussion.id] || ""}
                                           onChange={(e) => setCommentContent(prev => ({ ...prev, [discussion.id]: e.target.value }))}
                                           maxLength={1000}
                                           className="min-h-[80px]"
                                        />
                                        <div className="flex justify-between items-center">
                                           <span className="text-xs text-muted-foreground">
                                              {(commentContent[discussion.id] || "").length}/1000
                                           </span>
                                           <div className="flex gap-2">
                                              <Button
                                                 variant="outline"
                                                 size="sm"
                                                 onClick={() => {
                                                    setActiveCommentForm(null);
                                                    setCommentContent(prev => ({ ...prev, [discussion.id]: "" }));
                                                 }}
                                              >
                                                 Cancel
                                              </Button>
                                              <Button
                                                 size="sm"
                                                 onClick={() => handleAddComment(discussion.id)}
                                              >
                                                 Post Comment
                                              </Button>
                                           </div>
                                        </div>
                                     </div>
                                  ) : (
                                     <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-muted-foreground hover:text-primary"
                                        onClick={() => setActiveCommentForm(discussion.id)}
                                     >
                                        Reply
                                     </Button>
                                  )}
                               </div>
                            </CardContent>
                         </Card>
                      ))
                   )}
                </div>
             </TabsContent>

             <TabsContent value="stats" className="py-6">
                <div className="space-y-6">
                   <h3 className="text-xl font-bold">Model Statistics</h3>

                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Page Views (Last 30 Days) */}
                      <Card>
                         <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                               <div className="p-3 bg-blue-100 rounded-lg">
                                  <Eye className="w-6 h-6 text-blue-600" />
                               </div>
                               <div>
                                  <p className="text-sm text-muted-foreground">Page Views (30d)</p>
                                  <p className="text-2xl font-bold">{model.pageViews30Days.toLocaleString()}</p>
                               </div>
                            </div>
                         </CardContent>
                      </Card>

                      {/* Active Subscribers */}
                      <Card>
                         <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                               <div className="p-3 bg-green-100 rounded-lg">
                                  <Users className="w-6 h-6 text-green-600" />
                               </div>
                               <div>
                                  <p className="text-sm text-muted-foreground">Active Subscribers</p>
                                  <p className="text-2xl font-bold">{model.activeSubscribers.toLocaleString()}</p>
                               </div>
                            </div>
                         </CardContent>
                      </Card>

                      {/* Total Subscribers (All Time) */}
                      <Card>
                         <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                               <div className="p-3 bg-purple-100 rounded-lg">
                                  <TrendingUp className="w-6 h-6 text-purple-600" />
                               </div>
                               <div>
                                  <p className="text-sm text-muted-foreground">Total Subscribers</p>
                                  <p className="text-2xl font-bold">{model.totalSubscribers.toLocaleString()}</p>
                               </div>
                            </div>
                         </CardContent>
                      </Card>

                      {/* Engagement Rate */}
                      <Card>
                         <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                               <div className="p-3 bg-orange-100 rounded-lg">
                                  <BarChart className="w-6 h-6 text-orange-600" />
                               </div>
                               <div>
                                  <p className="text-sm text-muted-foreground">Engagement Rate</p>
                                  <p className="text-2xl font-bold">
                                     {((model.totalSubscribers / model.pageViews30Days) * 100).toFixed(1)}%
                                  </p>
                               </div>
                            </div>
                         </CardContent>
                      </Card>

                      {/* Discussions */}
                      <Card>
                         <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                               <div className="p-3 bg-pink-100 rounded-lg">
                                  <MessageSquare className="w-6 h-6 text-pink-600" />
                               </div>
                               <div>
                                  <p className="text-sm text-muted-foreground">Discussions</p>
                                  <p className="text-2xl font-bold">{model.discussionCount}</p>
                               </div>
                            </div>
                         </CardContent>
                      </Card>

                      {/* Downloads */}
                      <Card>
                         <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                               <div className="p-3 bg-cyan-100 rounded-lg">
                                  <Download className="w-6 h-6 text-cyan-600" />
                               </div>
                               <div>
                                  <p className="text-sm text-muted-foreground">Total Downloads</p>
                                  <p className="text-2xl font-bold">{model.stats.downloads.toLocaleString()}</p>
                               </div>
                            </div>
                         </CardContent>
                      </Card>
                   </div>
                </div>
             </TabsContent>
          </Tabs>
       </div>

       {/* Rating Modal */}
       <Dialog open={showRatingModal} onOpenChange={setShowRatingModal}>
          <DialogContent className="max-w-md">
             <DialogHeader>
                <DialogTitle>Rate this Model</DialogTitle>
                <DialogDescription>
                   How would you rate {model.name}?
                </DialogDescription>
             </DialogHeader>
             <div className="py-6">
                <div className="flex justify-center gap-2">
                   {[1, 2, 3, 4, 5].map((star) => (
                      <button
                         key={star}
                         onClick={() => setSelectedRating(star)}
                         onMouseEnter={() => setHoveredRating(star)}
                         onMouseLeave={() => setHoveredRating(0)}
                         className="transition-transform hover:scale-110"
                      >
                         <Star
                            className={`w-12 h-12 ${
                               star <= (hoveredRating || selectedRating)
                                  ? 'fill-orange-400 text-orange-400'
                                  : 'text-gray-300'
                            }`}
                         />
                      </button>
                   ))}
                </div>
                {selectedRating > 0 && (
                   <p className="text-center mt-4 text-sm text-muted-foreground">
                      You selected {selectedRating} star{selectedRating !== 1 ? 's' : ''}
                   </p>
                )}
             </div>
             <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => {
                   setShowRatingModal(false);
                   setSelectedRating(0);
                   setHoveredRating(0);
                }}>
                   Cancel
                </Button>
                <Button
                   onClick={handleRatingSubmit}
                   disabled={selectedRating === 0}
                >
                   Submit Rating
                </Button>
             </div>
          </DialogContent>
       </Dialog>

       {/* Discussion Creation Modal */}
       <Dialog open={showDiscussionModal} onOpenChange={setShowDiscussionModal}>
          <DialogContent className="max-w-2xl">
             <DialogHeader>
                <DialogTitle>Start New Discussion</DialogTitle>
                <DialogDescription>
                   Ask a question or start a conversation about {model.name}
                </DialogDescription>
             </DialogHeader>
             <div className="space-y-4 py-4">
                <div className="space-y-2">
                   <Label htmlFor="discussion-title">Discussion Title <span className="text-destructive">*</span></Label>
                   <Input
                      id="discussion-title"
                      placeholder="What would you like to discuss?"
                      value={discussionTitle}
                      onChange={(e) => setDiscussionTitle(e.target.value)}
                      maxLength={100}
                   />
                   <p className="text-xs text-muted-foreground text-right">
                      {discussionTitle.length}/100
                   </p>
                </div>
                <div className="space-y-2">
                   <Label htmlFor="discussion-content">Description <span className="text-destructive">*</span></Label>
                   <Textarea
                      id="discussion-content"
                      placeholder="Provide details about your question or topic..."
                      value={discussionContent}
                      onChange={(e) => setDiscussionContent(e.target.value)}
                      maxLength={2000}
                      className="min-h-[150px]"
                   />
                   <p className="text-xs text-muted-foreground text-right">
                      {discussionContent.length}/2000
                   </p>
                </div>
             </div>
             <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => {
                   setShowDiscussionModal(false);
                   setDiscussionTitle("");
                   setDiscussionContent("");
                }}>
                   Cancel
                </Button>
                <Button
                   onClick={handleCreateDiscussion}
                   disabled={!discussionTitle.trim() || !discussionContent.trim()}
                >
                   Post Discussion
                </Button>
             </div>
          </DialogContent>
       </Dialog>
    </Layout>
  );
}
