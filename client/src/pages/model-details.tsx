import { Layout } from "@/components/layout/Layout";
import { MOCK_MODELS, MOCK_DISCUSSIONS, CURRENT_USER, MOCK_SUBSCRIPTIONS } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle, Clock, Download, MessageSquare, Shield, Star, Lock, Activity, FileText, Unlock, Eye, Users, TrendingUp, BarChart, Mail } from "lucide-react";
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

export default function ModelDetailsPage() {
  const [match, params] = useRoute("/model/:id");
  const modelId = params?.id;
  const model = MOCK_MODELS.find(m => m.id === modelId);
  const { toast } = useToast();

  const [subscriptionStatus, setSubscriptionStatus] = useState<'none' | 'active' | 'pending'>('none');
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

  // Check subscription status from MOCK_SUBSCRIPTIONS
  useEffect(() => {
    if (model) {
      const userSubscription = MOCK_SUBSCRIPTIONS.find(
        sub => sub.modelId === model.id && sub.buyerId === CURRENT_USER.id
      );

      if (userSubscription) {
        setSubscriptionStatus(userSubscription.status === 'active' ? 'active' : 'pending');
      } else {
        setSubscriptionStatus('none');
      }
    }
  }, [model]);

  if (!model) return <div>Model not found</div>;

  const handleSubscribe = () => {
    if (model.price === "free") {
      // Free model - immediate subscription
      setSubscriptionStatus('active');
      toast({
        title: `Successfully subscribed to ${model.name}!`,
        description: "You now have access to model files and documentation.",
      });
      // In a real app, this would add to MOCK_SUBSCRIPTIONS via API
    } else {
      // Paid model - show unavailable message
      toast({
        title: "Paid Subscription Unavailable",
        description: "Payment method coming soon.",
        variant: "default",
      });
    }
  };

  const isPublisher = CURRENT_USER.role === 'publisher';

  const handleBack = () => {
    window.history.back();
  };

  const handleRatingSubmit = () => {
    if (selectedRating > 0) {
      toast({
        title: "Rating Submitted",
        description: `You rated this model ${selectedRating} out of 5 stars.`,
      });
      setShowRatingModal(false);
      // In a real app, this would send the rating to the backend
    }
  };

  const handleCreateDiscussion = () => {
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

    // Create new discussion (in real app, this would be API call)
    const newDiscussion = {
      id: `d${Date.now()}`,
      modelId: model.id,
      userId: CURRENT_USER.id,
      userName: CURRENT_USER.name,
      content: `**${discussionTitle}**\n\n${discussionContent}`,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      replies: [],
    };

    // Add to mock data (in real app, would update via API)
    MOCK_DISCUSSIONS.push(newDiscussion);

    toast({
      title: "Discussion Created",
      description: "Your discussion has been posted.",
    });

    setShowDiscussionModal(false);
    setDiscussionTitle("");
    setDiscussionContent("");
  };

  const handleAddComment = (discussionId: string) => {
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

    // Create new comment (in real app, this would be API call)
    const newComment = {
      id: `r${Date.now()}`,
      modelId: model.id,
      userId: CURRENT_USER.id,
      userName: CURRENT_USER.name,
      content: content,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    };

    // Add to discussion replies (in real app, would update via API)
    const discussion = MOCK_DISCUSSIONS.find(d => d.id === discussionId);
    if (discussion) {
      if (!discussion.replies) {
        discussion.replies = [];
      }
      discussion.replies.push(newComment);
    }

    toast({
      title: "Comment Added",
      description: "Your comment has been posted.",
    });

    // Clear comment form
    setCommentContent(prev => ({ ...prev, [discussionId]: "" }));
    setActiveCommentForm(null);
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
                <div className="flex items-center gap-3">
                   <Badge>{model.category}</Badge>
                   <span className="text-sm text-muted-foreground">Updated {model.updatedAt}</span>
                </div>
                <h1 className="text-4xl font-heading font-bold">{model.name}</h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                   {model.description}
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
                      <Button disabled className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white">
                         <CheckCircle className="w-4 h-4" />
                         {model.price === 'free' ? 'Subscribed' : `Subscribed (MYR ${model.priceAmount?.toFixed(2)}/month)`}
                      </Button>
                   ) : subscriptionStatus === 'pending' ? (
                      <Button disabled className="w-full gap-2 bg-orange-500 hover:bg-orange-600 text-white">
                         <Clock className="w-4 h-4" />
                         Pending Approval...
                      </Button>
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-6 bg-card border border-border rounded-xl shadow-sm">
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
             <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-6">
                <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-4 py-3">
                   Overview
                </TabsTrigger>
                <TabsTrigger value="docs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-4 py-3">
                   Docs
                </TabsTrigger>
                <TabsTrigger value="files" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-4 py-3">
                   Files
                </TabsTrigger>
                <TabsTrigger value="discussion" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-4 py-3">
                   Discussion
                </TabsTrigger>
                <TabsTrigger value="stats" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-4 py-3">
                   Stats
                </TabsTrigger>
             </TabsList>

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
                   <h3 className="text-xl font-bold mb-4">Technical Documentation</h3>
                   <div className="prose max-w-none text-muted-foreground text-sm">
                      <p>
                         This model is built using the latest transformer architecture optimized for Malaysian contexts. 
                         It accepts JSON payloads via REST API and returns confidence scores along with predictions.
                      </p>
                      <pre className="bg-secondary p-4 rounded-lg overflow-x-auto mt-4">
                         <code>
{`// Sample API Request
POST /api/v1/predict
{
  "input": "Sample text for analysis",
  "threshold": 0.85
}`}
                         </code>
                      </pre>
                   </div>
                </div>

                {/* Model Details Section */}
                <div>
                   <h3 className="text-xl font-bold mb-4">Model Details</h3>
                   <div className="space-y-3 text-sm">
                      <div className="flex gap-2">
                         <span className="text-muted-foreground min-w-32">Creator:</span>
                         <a href={`mailto:${model.publisherEmail}`} className="text-primary hover:underline">
                            {model.publisherName}
                         </a>
                      </div>
                      <div className="flex gap-2">
                         <span className="text-muted-foreground min-w-32">Collaborators:</span>
                         <div>
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
                      <div className="flex gap-2">
                         <span className="text-muted-foreground min-w-32">Published On:</span>
                         <span>{new Date(model.publishedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <div className="flex gap-2">
                         <span className="text-muted-foreground min-w-32">Last Update:</span>
                         <span>{new Date(model.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
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
                      <div className="bg-secondary/20 p-6 rounded-lg border border-border">
                         <pre className="text-sm overflow-x-auto whitespace-pre-wrap font-mono">
                            {model.apiDocumentation}
                         </pre>
                      </div>
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
                   {isPublisher ? (
                      <div className="flex flex-col items-center justify-center py-12 bg-secondary/20 rounded-lg border border-dashed border-border">
                         <Lock className="w-12 h-12 text-muted-foreground mb-4" />
                         <h3 className="text-lg font-bold">Preview Mode</h3>
                         <p className="text-muted-foreground mb-4">File downloads are only available for buyers.</p>
                      </div>
                   ) : subscriptionStatus === 'active' ? (
                      <>
                         <Card>
                            <CardContent className="p-4 flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                  <div className="p-2 bg-secondary rounded">
                                     <FileText className="w-5 h-5" />
                                  </div>
                                  <div>
                                     <p className="font-medium">model-weights-v2.1.0.h5</p>
                                     <p className="text-xs text-muted-foreground">145 MB • TensorFlow</p>
                                  </div>
                               </div>
                               <Button variant="outline" size="sm">
                                  <Download className="w-4 h-4 mr-2" /> Download
                               </Button>
                            </CardContent>
                         </Card>
                         <Card>
                            <CardContent className="p-4 flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                  <div className="p-2 bg-secondary rounded">
                                     <FileText className="w-5 h-5" />
                                  </div>
                                  <div>
                                     <p className="font-medium">python-sdk-1.0.0.zip</p>
                                     <p className="text-xs text-muted-foreground">2.4 MB • Python Client</p>
                                  </div>
                               </div>
                               <Button variant="outline" size="sm">
                                  <Download className="w-4 h-4 mr-2" /> Download
                               </Button>
                            </CardContent>
                         </Card>
                      </>
                   ) : (
                      <div className="flex flex-col items-center justify-center py-12 bg-secondary/20 rounded-lg border border-dashed border-border">
                         <Lock className="w-12 h-12 text-muted-foreground mb-4" />
                         <h3 className="text-lg font-bold">Access Restricted</h3>
                         <p className="text-muted-foreground mb-4">Subscribe to this model to access files and SDKs.</p>
                         <Button onClick={handleSubscribe}>Subscribe Now</Button>
                      </div>
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
                   {MOCK_DISCUSSIONS.filter(d => d.modelId === model.id).length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 bg-secondary/20 rounded-lg border border-dashed border-border">
                         <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
                         <h4 className="text-lg font-bold">No discussions yet</h4>
                         <p className="text-muted-foreground mb-4">Be the first to start a discussion</p>
                         <Button variant="outline" onClick={() => setShowDiscussionModal(true)}>
                            + Start Discussion
                         </Button>
                      </div>
                   ) : (
                      MOCK_DISCUSSIONS.filter(d => d.modelId === model.id).map(discussion => (
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
