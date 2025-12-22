import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Check, Upload, FileText, Code, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, title: "General Info", icon: FileText },
  { id: 2, title: "Technical Details", icon: Code },
  { id: 3, title: "Files & Assets", icon: Upload },
  { id: 4, title: "Collaborators", icon: Users },
];

export default function CreateModelPage() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else handleSubmit();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    toast({
      title: "Model Created Successfully",
      description: "Your model has been submitted for review.",
    });
    setLocation("/publisher/my-models");
  };

  return (
    <Layout type="dashboard">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/publisher/my-models")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
             <h1 className="text-3xl font-heading font-bold">Create New Model</h1>
             <p className="text-muted-foreground">Follow the steps to publish your AI model.</p>
          </div>
        </div>

        {/* Wizard Progress */}
        <div className="relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-secondary -z-10 -translate-y-1/2 rounded-full" />
          <div 
             className="absolute top-1/2 left-0 h-1 bg-primary -z-10 -translate-y-1/2 rounded-full transition-all duration-300" 
             style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
          />
          <div className="flex justify-between">
            {STEPS.map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-2 bg-background p-2">
                <div 
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    step >= s.id ? "border-primary bg-primary text-primary-foreground shadow-lg" : "border-muted-foreground/30 bg-background text-muted-foreground"
                  )}
                >
                  {step > s.id ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                </div>
                <span className={cn("text-xs font-medium", step >= s.id ? "text-primary" : "text-muted-foreground")}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Content */}
        <Card className="min-h-[400px] border-border/50 shadow-md">
           <CardContent className="p-8">
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                   <div className="grid gap-4">
                      <div className="space-y-2">
                         <Label>Model Name <span className="text-destructive">*</span></Label>
                         <Input placeholder="e.g. Traffic Pattern Analyzer Pro" />
                      </div>
                      <div className="space-y-2">
                         <Label>Short Description <span className="text-destructive">*</span></Label>
                         <Input placeholder="Brief summary of what your model does" />
                      </div>
                      <div className="space-y-2">
                         <Label>Category</Label>
                         <Select>
                            <SelectTrigger>
                               <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                               <SelectItem value="healthcare">Healthcare</SelectItem>
                               <SelectItem value="finance">Finance</SelectItem>
                               <SelectItem value="nlp">NLP</SelectItem>
                               <SelectItem value="vision">Computer Vision</SelectItem>
                            </SelectContent>
                         </Select>
                      </div>
                      <div className="space-y-2">
                         <Label>Detailed Description</Label>
                         <Textarea placeholder="Markdown supported. Describe methodology, use cases, and limitations." className="min-h-[150px]" />
                      </div>
                   </div>
                </div>
              )}

              {step === 2 && (
                 <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="grid md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <Label>Version</Label>
                          <Input placeholder="1.0.0" />
                       </div>
                       <div className="space-y-2">
                          <Label>Response Time (ms)</Label>
                          <Input type="number" placeholder="120" />
                       </div>
                       <div className="space-y-2">
                          <Label>Accuracy (%)</Label>
                          <Input type="number" placeholder="98.5" />
                       </div>
                       <div className="space-y-2">
                          <Label>Framework</Label>
                          <Input placeholder="TensorFlow, PyTorch, etc." />
                       </div>
                    </div>
                    <div className="space-y-2">
                        <Label>API Specification (JSON/YAML)</Label>
                        <Textarea className="font-mono text-xs" placeholder="{ ... }" rows={10} />
                    </div>
                 </div>
              )}

              {step === 3 && (
                 <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="border-2 border-dashed border-border rounded-lg p-12 flex flex-col items-center justify-center text-center hover:bg-secondary/20 transition-colors cursor-pointer">
                        <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                        <h3 className="font-semibold text-lg">Upload Model Files</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mt-2">
                           Drag and drop your model weights (.h5, .pt, .onnx) here, or click to browse.
                           Max 100MB for direct upload.
                        </p>
                    </div>
                    
                    <div className="space-y-2">
                       <div className="flex items-center gap-2">
                          <span className="w-full border-t" />
                          <span className="text-xs uppercase text-muted-foreground whitespace-nowrap">Or External URL</span>
                          <span className="w-full border-t" />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <Label>External Download URL (for large files)</Label>
                       <Input placeholder="https://s3.amazonaws.com/..." />
                    </div>
                 </div>
              )}

              {step === 4 && (
                 <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-4">
                       <Label>Add Collaborators</Label>
                       <div className="flex gap-2">
                          <Input placeholder="collaborator@email.com" />
                          <Button variant="secondary">Add</Button>
                       </div>
                       <p className="text-xs text-muted-foreground">
                          Collaborators will have edit access to this model page.
                       </p>
                    </div>

                    <div className="bg-secondary/20 rounded-lg p-4">
                       <h4 className="font-medium text-sm mb-3">Current Team</h4>
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                             DA
                          </div>
                          <div>
                             <p className="text-sm font-medium">Dr. Aminah (You)</p>
                             <p className="text-xs text-muted-foreground">Owner</p>
                          </div>
                       </div>
                    </div>
                 </div>
              )}
           </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="flex justify-between">
           <Button variant="outline" onClick={handleBack} disabled={step === 1}>
              Back
           </Button>
           <Button onClick={handleNext} className="gap-2">
              {step === 4 ? "Create Model" : "Next Step"}
              {step !== 4 && <ArrowRight className="w-4 h-4" />}
           </Button>
        </div>

      </div>
    </Layout>
  );
}
