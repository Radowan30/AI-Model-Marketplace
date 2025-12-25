import { Layout } from "@/components/layout/Layout";
import { MOCK_MODELS, MOCK_DISCUSSIONS, CURRENT_USER } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, Clock, Download, MessageSquare, Shield, Star, Lock, Activity, FileText } from "lucide-react";
import { useRoute, Link } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ModelDetailsPage() {
  const [match, params] = useRoute("/model/:id");
  const modelId = params?.id;
  const model = MOCK_MODELS.find(m => m.id === modelId);
  const { toast } = useToast();
  const [subscribed, setSubscribed] = useState(false);

  // In a real app, check subscription status from backend
  // Here we just toggle state for demo

  if (!model) return <div>Model not found</div>;

  const handleSubscribe = () => {
    setSubscribed(true);
    toast({
      title: "Subscription Request Sent",
      description: model.price === "free" ? "You now have access to this model." : "The publisher will review your request.",
    });
  };

  // Determine marketplace URL based on user role
  const marketplaceUrl = CURRENT_USER.role === 'publisher' ? '/marketplace?preview=true' : '/marketplace';
  const isPublisher = CURRENT_USER.role === 'publisher';

  return (
    <Layout type="dashboard">
       <div className="max-w-5xl mx-auto space-y-8">
          <Link href={marketplaceUrl}>
             <Button variant="ghost" className="gap-2 pl-0 hover:pl-2 transition-all">
                <ArrowLeft className="w-4 h-4" /> Back to Marketplace
             </Button>
          </Link>

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
                   <div className="space-y-2">
                      <div className="flex justify-between items-center">
                         <span className="text-muted-foreground text-sm">License</span>
                         <span className="font-semibold uppercase">{model.price}</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-muted-foreground text-sm">Version</span>
                         <span className="font-mono text-sm">{model.version}</span>
                      </div>
                   </div>

                   <Separator className="bg-primary/10" />

                   {isPublisher ? (
                      <div className="text-center py-2">
                         <p className="text-sm text-muted-foreground">
                           Preview Mode - Subscription only available for buyers
                         </p>
                      </div>
                   ) : subscribed ? (
                      <Button className="w-full gap-2 bg-green-600 hover:bg-green-700">
                         <CheckCircle className="w-4 h-4" /> Access Active
                      </Button>
                   ) : (
                      <>
                         <Button className="w-full shadow-md" onClick={handleSubscribe}>
                            {model.price === 'free' ? 'Get for Free' : 'Subscribe to Access'}
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-card border border-border rounded-xl shadow-sm">
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
                   <p className="text-xs text-muted-foreground">Latency</p>
                   <p className="font-bold text-lg">{model.stats.responseTime}ms</p>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                   <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                   <p className="text-xs text-muted-foreground">Uptime</p>
                   <p className="font-bold text-lg">{model.stats.uptime}%</p>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                   <Star className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                   <p className="text-xs text-muted-foreground">Rating</p>
                   <p className="font-bold text-lg">4.8/5</p>
                </div>
             </div>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="overview" className="w-full">
             <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-6">
                <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-4 py-3">
                   Overview
                </TabsTrigger>
                <TabsTrigger value="files" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-4 py-3">
                   Files & SDK
                </TabsTrigger>
                <TabsTrigger value="discussion" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-4 py-3">
                   Discussion
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
             </TabsContent>

             <TabsContent value="files" className="py-6">
                <div className="space-y-4">
                   {isPublisher ? (
                      <div className="flex flex-col items-center justify-center py-12 bg-secondary/20 rounded-lg border border-dashed border-border">
                         <Lock className="w-12 h-12 text-muted-foreground mb-4" />
                         <h3 className="text-lg font-bold">Preview Mode</h3>
                         <p className="text-muted-foreground mb-4">File downloads are only available for buyers.</p>
                      </div>
                   ) : subscribed ? (
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
                   <Button variant="outline" size="sm">Start New Topic</Button>
                </div>
                
                <div className="space-y-6">
                   {MOCK_DISCUSSIONS.filter(d => d.modelId === 'm1').map(discussion => ( // Hardcoded filter for demo
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
                            <p className="text-sm">{discussion.content}</p>
                            
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
                         </CardContent>
                      </Card>
                   ))}
                </div>
             </TabsContent>
          </Tabs>
       </div>
    </Layout>
  );
}
