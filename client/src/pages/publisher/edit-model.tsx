import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Check, Upload, FileText, Code, Users, X, Plus, Info, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CURRENT_USER, MOCK_MODELS } from "@/lib/mock-data";

const STEPS = [
  { id: 1, title: "General Info", icon: FileText },
  { id: 2, title: "Technical Details", icon: Code },
  { id: 3, title: "Files & Assets", icon: Upload },
  { id: 4, title: "Collaborators", icon: Users },
];

// Mock publishers data for collaborators dropdown
const PUBLISHERS = [
  { id: 'u2', name: 'University Malaya NLP Group', email: 'nlp@um.edu.my' },
  { id: 'u3', name: 'Sime Darby R&D', email: 'research@simedarby.com' },
  { id: 'u4', name: 'Petronas Digital', email: 'digital@petronas.com' },
  { id: 'u5', name: 'TM Innovation', email: 'innovation@tm.com.my' },
];

interface Collaborator {
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
}

interface FileEntry {
  id: string;
  name: string;
  type: 'upload' | 'url';
  description?: string;
  file?: File;
  url?: string;
  size?: number;
}

// Helper function to get user initials
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export default function EditModelPage() {
  const [match, params] = useRoute("/publisher/edit-model/:id");
  const modelId = params?.id;
  const model = MOCK_MODELS.find(m => m.id === modelId);
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Tab 1: General Info state
  const [modelName, setModelName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [category, setCategory] = useState("");
  const [version, setVersion] = useState("");
  const [priceType, setPriceType] = useState<"free" | "paid" | "">("");
  const [price, setPrice] = useState("");
  const [detailedDescription, setDetailedDescription] = useState("");

  // Tab 2: Technical Details state
  const [featuresInput, setFeaturesInput] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [responseTime, setResponseTime] = useState("");
  const [accuracy, setAccuracy] = useState("");
  const [apiSpecFormat, setApiSpecFormat] = useState("json");
  const [apiSpec, setApiSpec] = useState("");
  const [apiSpecPreview, setApiSpecPreview] = useState(false);

  // Tab 3: Files state
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState<'upload' | 'url'>('upload');
  const [fileUrl, setFileUrl] = useState("");
  const [fileDescription, setFileDescription] = useState("");
  const [files, setFiles] = useState<FileEntry[]>([]);

  // Tab 4: Collaborators state
  const [collabEmail, setCollabEmail] = useState("");
  const [collabFirstName, setCollabFirstName] = useState("");
  const [collabLastName, setCollabLastName] = useState("");
  const [selectedPublisher, setSelectedPublisher] = useState("");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  // Pre-fill form with existing model data
  useEffect(() => {
    if (model) {
      setModelName(model.name);
      setShortDescription(model.description);
      setCategory(model.category);
      setVersion(model.version);
      setPriceType(model.price);
      setPrice(model.priceAmount?.toString() || "");
      setFeatures(model.features);
      setResponseTime(model.stats.responseTime.toString());
      setAccuracy(model.stats.accuracy.toString());
    }
  }, [model]);

  // Redirect if model not found
  if (!model) {
    return (
      <Layout type="dashboard">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <h2 className="text-2xl font-bold mb-4">Model Not Found</h2>
          <Button onClick={() => setLocation("/publisher/my-models")}>
            Back to My Models
          </Button>
        </div>
      </Layout>
    );
  }

  // Validation for Tab 1: General Info
  const isTab1Complete = () => {
    const basicValidation = (
      modelName.trim().length > 0 &&
      modelName.length <= 25 &&
      shortDescription.trim().length > 0 &&
      shortDescription.length <= 700 &&
      category.trim().length > 0 &&
      version.trim().length > 0 &&
      priceType !== ""
    );

    // If paid, price must be filled and greater than 0
    if (priceType === "paid") {
      return basicValidation && price.trim().length > 0 && parseFloat(price) > 0;
    }

    return basicValidation;
  };

  // Validation for Tab 2: Technical Details - Response Time and Accuracy are required
  const isTab2Complete = () => {
    return (
      responseTime.trim().length > 0 &&
      accuracy.trim().length > 0
    );
  };

  // Validation for Tab 3: Files - At least one file must be added
  const isTab3Complete = () => {
    return files.length > 0;
  };

  // Tab 4: Collaborators - Optional (no required fields)
  // Shows purple highlight if collaborators added, but not a checkmark
  const isTab4Complete = () => {
    return false; // Never shows checkmark since it's optional
  };

  // Check if Tab 4 has collaborators (for purple highlighting)
  const hasCollaborators = () => {
    return collaborators.length > 0;
  };

  // Check if a specific tab is complete
  const isTabComplete = (tabNumber: number) => {
    switch (tabNumber) {
      case 1: return isTab1Complete();
      case 2: return isTab2Complete();
      case 3: return isTab3Complete();
      case 4: return isTab4Complete();
      default: return false;
    }
  };

  // Check if all required fields across all tabs are complete
  const isAllRequiredFieldsComplete = () => {
    return isTab1Complete() && isTab2Complete() && isTab3Complete();
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    if (!isAllRequiredFieldsComplete()) {
      const missingFields = [];
      if (!isTab1Complete()) missingFields.push("General Info");
      if (!isTab2Complete()) missingFields.push("Technical Details (Response Time & Accuracy)");
      if (!isTab3Complete()) missingFields.push("Files & Assets (at least one file)");

      toast({
        title: "Validation Error",
        description: `Please complete all required fields: ${missingFields.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Model Updated Successfully",
      description: "Your changes have been saved.",
    });
    setLocation("/publisher/my-models");
  };

  // Tab 2: Add feature handler
  const handleAddFeature = () => {
    if (featuresInput.trim()) {
      const newFeatures = featuresInput
        .split(',')
        .map(f => f.trim())
        .filter(f => f.length > 0);
      setFeatures([...features, ...newFeatures]);
      setFeaturesInput("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  // Tab 3: Add file handler
  const handleAddFile = () => {
    if (!fileName.trim()) {
      toast({
        title: "Validation Error",
        description: "File name is required.",
        variant: "destructive",
      });
      return;
    }

    if (fileType === 'url' && !fileUrl.trim()) {
      toast({
        title: "Validation Error",
        description: "External URL is required.",
        variant: "destructive",
      });
      return;
    }

    const newFile: FileEntry = {
      id: Date.now().toString(),
      name: fileName,
      type: fileType,
      description: fileDescription,
      url: fileType === 'url' ? fileUrl : undefined,
    };

    setFiles([...files, newFile]);

    // Clear form
    setFileName("");
    setFileUrl("");
    setFileDescription("");
  };

  const handleRemoveFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
  };

  // Tab 4: Add collaborator by email handler
  const handleAddCollaborator = () => {
    if (!collabEmail.trim() || !collabFirstName.trim() || !collabLastName.trim()) {
      toast({
        title: "Validation Error",
        description: "All fields are required to add a collaborator.",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(collabEmail)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    const newCollab: Collaborator = {
      email: collabEmail,
      firstName: collabFirstName,
      lastName: collabLastName,
      role: 'Collaborator',
    };

    setCollaborators([...collaborators, newCollab]);

    // Clear form
    setCollabEmail("");
    setCollabFirstName("");
    setCollabLastName("");
  };

  // Tab 4: Add existing publisher handler
  const handleAddPublisher = () => {
    if (!selectedPublisher) return;

    const publisher = PUBLISHERS.find(p => p.id === selectedPublisher);
    if (!publisher) return;

    // Check if already added
    if (collaborators.some(c => c.email === publisher.email)) {
      toast({
        title: "Already Added",
        description: "This publisher is already in the collaborators list.",
        variant: "destructive",
      });
      return;
    }

    const [firstName, ...lastNameParts] = publisher.name.split(' ');
    const newCollab: Collaborator = {
      email: publisher.email,
      firstName: firstName,
      lastName: lastNameParts.join(' '),
      role: 'Publisher',
    };

    setCollaborators([...collaborators, newCollab]);
    setSelectedPublisher("");
  };

  const handleRemoveCollaborator = (email: string) => {
    setCollaborators(collaborators.filter(c => c.email !== email));
  };

  return (
    <Layout type="dashboard">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/publisher/my-models")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
             <h1 className="text-3xl font-heading font-bold">Edit Model</h1>
             <p className="text-muted-foreground">Update your model information.</p>
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
            {STEPS.map((s) => {
              const isComplete = isTabComplete(s.id);
              const isCurrent = step === s.id;
              // Special case for Tab 4: show purple highlight if has collaborators
              const isTab4WithCollaborators = s.id === 4 && hasCollaborators();

              return (
                <div
                  key={s.id}
                  className="flex flex-col items-center gap-2 bg-background p-2 cursor-pointer"
                  onClick={() => setStep(s.id)}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                      isComplete
                        ? "border-primary bg-primary text-primary-foreground shadow-lg"
                        : isCurrent || isTab4WithCollaborators
                        ? "border-primary bg-background text-primary"
                        : "border-muted-foreground/30 bg-background text-muted-foreground"
                    )}
                  >
                    {isComplete ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                  </div>
                  <span className={cn(
                    "text-xs font-medium",
                    isComplete || isCurrent || isTab4WithCollaborators ? "text-primary" : "text-muted-foreground"
                  )}>
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wizard Content */}
        <Card className="min-h-[400px] border-border/50 shadow-md">
           <CardContent className="p-8">
              {/* TAB 1: GENERAL INFO */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                   <div className="grid gap-4">
                      <div className="space-y-2">
                         <Label>Model Name <span className="text-destructive">*</span></Label>
                         <Input
                           placeholder="e.g. Traffic Pattern Analyzer Pro"
                           value={modelName}
                           onChange={(e) => setModelName(e.target.value.slice(0, 25))}
                           maxLength={25}
                         />
                         <p className={cn(
                           "text-xs",
                           modelName.length > 20 ? "text-destructive" : "text-muted-foreground"
                         )}>
                           {modelName.length} / 25 characters
                         </p>
                      </div>

                      <div className="space-y-2">
                         <Label>Short Description <span className="text-destructive">*</span></Label>
                         <Input
                           placeholder="Brief summary of what your model does"
                           value={shortDescription}
                           onChange={(e) => setShortDescription(e.target.value.slice(0, 700))}
                           maxLength={700}
                         />
                         <p className={cn(
                           "text-xs",
                           shortDescription.length > 650 ? "text-destructive" : "text-muted-foreground"
                         )}>
                           {shortDescription.length} / 700 characters
                         </p>
                      </div>

                      <div className="space-y-2">
                         <Label>Category <span className="text-destructive">*</span></Label>
                         <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger>
                               <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                               <SelectItem value="healthcare">Healthcare</SelectItem>
                               <SelectItem value="finance">Finance</SelectItem>
                               <SelectItem value="nlp">NLP</SelectItem>
                               <SelectItem value="vision">Computer Vision</SelectItem>
                               <SelectItem value="smart-city">Smart City</SelectItem>
                               <SelectItem value="agriculture">Agriculture</SelectItem>
                            </SelectContent>
                         </Select>
                      </div>

                      <div className="space-y-2">
                         <Label>Version <span className="text-destructive">*</span></Label>
                         <Input
                           placeholder="e.g., 1.0.0 or v2.1"
                           value={version}
                           onChange={(e) => setVersion(e.target.value)}
                         />
                      </div>

                      <div className="space-y-2">
                         <Label>Price Type <span className="text-destructive">*</span></Label>
                         <Select value={priceType} onValueChange={(value) => setPriceType(value as "free" | "paid")}>
                            <SelectTrigger>
                               <SelectValue placeholder="Select price type" />
                            </SelectTrigger>
                            <SelectContent>
                               <SelectItem value="free">Free</SelectItem>
                               <SelectItem value="paid">Paid</SelectItem>
                            </SelectContent>
                         </Select>
                      </div>

                      {priceType === "paid" && (
                        <div className="space-y-2">
                           <Label>Price (MYR) <span className="text-destructive">*</span></Label>
                           <Input
                             type="number"
                             placeholder="e.g., 1000.00"
                             value={price}
                             onChange={(e) => setPrice(e.target.value)}
                             min="0"
                             step="0.01"
                           />
                           {price && parseFloat(price) <= 0 && (
                             <p className="text-xs text-destructive">
                               Price must be greater than 0
                             </p>
                           )}
                        </div>
                      )}

                      <div className="space-y-2">
                         <Label>Detailed Description</Label>
                         <Textarea
                           placeholder="Markdown supported. Describe methodology, use cases, and limitations."
                           className="min-h-[150px]"
                           value={detailedDescription}
                           onChange={(e) => setDetailedDescription(e.target.value)}
                         />
                      </div>
                   </div>
                </div>
              )}

              {/* TAB 2: TECHNICAL DETAILS */}
              {step === 2 && (
                 <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-4">
                       <Label>Features (comma-separated)</Label>
                       <div className="flex gap-2">
                          <Input
                            placeholder="e.g., Real-time processing, Multi-language support, Cloud-based"
                            value={featuresInput}
                            onChange={(e) => setFeaturesInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddFeature();
                              }
                            }}
                          />
                          <Button type="button" variant="secondary" onClick={handleAddFeature} className="gap-2">
                            <Plus className="w-4 h-4" /> Add Features
                          </Button>
                       </div>
                       {features.length > 0 && (
                         <div className="flex flex-wrap gap-2 mt-2">
                           {features.map((feature, index) => (
                             <Badge key={index} variant="secondary" className="gap-1">
                               {feature}
                               <X
                                 className="w-3 h-3 cursor-pointer hover:text-destructive"
                                 onClick={() => handleRemoveFeature(index)}
                               />
                             </Badge>
                           ))}
                         </div>
                       )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <Label>Response Time (ms) <span className="text-destructive">*</span></Label>
                          <Input
                            type="number"
                            placeholder="120"
                            value={responseTime}
                            onChange={(e) => setResponseTime(e.target.value)}
                          />
                       </div>
                       <div className="space-y-2">
                          <Label>Accuracy (%) <span className="text-destructive">*</span></Label>
                          <Input
                            type="number"
                            placeholder="98.5"
                            value={accuracy}
                            onChange={(e) => setAccuracy(e.target.value)}
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>API Specification</Label>
                          <div className="flex gap-2">
                            <Select value={apiSpecFormat} onValueChange={setApiSpecFormat}>
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="json">JSON</SelectItem>
                                <SelectItem value="yaml">YAML</SelectItem>
                                <SelectItem value="markdown">Markdown</SelectItem>
                                <SelectItem value="text">Plain Text</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              type="button"
                              variant={apiSpecPreview ? "default" : "outline"}
                              size="sm"
                              onClick={() => setApiSpecPreview(!apiSpecPreview)}
                            >
                              {apiSpecPreview ? "Edit" : "Preview"}
                            </Button>
                          </div>
                        </div>

                        {!apiSpecPreview ? (
                          <Textarea
                            className="font-mono text-xs"
                            placeholder={apiSpecFormat === 'json' ? '{\n  "endpoint": "/predict",\n  "method": "POST"\n}' : '# API Documentation\n\nDescribe your API...'}
                            rows={10}
                            value={apiSpec}
                            onChange={(e) => setApiSpec(e.target.value)}
                          />
                        ) : (
                          <div className="border rounded-lg p-4 bg-secondary/20 min-h-[240px]">
                            <pre className="font-mono text-xs whitespace-pre-wrap break-words">
                              {apiSpec || "No content to preview"}
                            </pre>
                          </div>
                        )}
                    </div>
                 </div>
              )}

              {/* TAB 3: FILES */}
              {step === 3 && (
                 <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <Alert className="bg-blue-50 border-blue-200">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        Files under 100MB can be uploaded directly. Use external URLs for larger resources.
                      </AlertDescription>
                    </Alert>

                    {/* File Form */}
                    <div className="border rounded-lg p-6 space-y-4 bg-secondary/10">
                      <h3 className="font-semibold text-lg">Add File</h3>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>File Name <span className="text-destructive">*</span></Label>
                          <Input
                            placeholder="e.g., model_weights.h5"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>File Type <span className="text-destructive">*</span></Label>
                          <Select value={fileType} onValueChange={(val) => setFileType(val as 'upload' | 'url')}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="upload">Upload File (&lt; 100MB)</SelectItem>
                              <SelectItem value="url">External URL (&gt; 100MB)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {fileType === 'upload' ? (
                        <div className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-secondary/20 transition-colors cursor-pointer">
                          <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Drag and drop your file here, or click to browse
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label>External URL <span className="text-destructive">*</span></Label>
                          <Input
                            placeholder="https://s3.amazonaws.com/..."
                            value={fileUrl}
                            onChange={(e) => setFileUrl(e.target.value)}
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Description (Optional)</Label>
                        <Textarea
                          placeholder="Brief description of this file"
                          rows={3}
                          value={fileDescription}
                          onChange={(e) => setFileDescription(e.target.value)}
                        />
                      </div>

                      <Button type="button" onClick={handleAddFile} className="w-full gap-2">
                        <Plus className="w-4 h-4" /> Add File
                      </Button>
                    </div>

                    {/* File List */}
                    {files.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-semibold">Added Files ({files.length})</h3>
                        <div className="space-y-2">
                          {files.map((file) => (
                            <div
                              key={file.id}
                              className="flex items-start justify-between p-4 border rounded-lg bg-card hover:bg-secondary/20 transition-colors"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-muted-foreground" />
                                  <p className="font-medium">{file.name}</p>
                                  <Badge variant="outline" className="text-xs">
                                    {file.type === 'upload' ? 'Upload' : 'URL'}
                                  </Badge>
                                </div>
                                {file.description && (
                                  <p className="text-sm text-muted-foreground mt-1 ml-6">
                                    {file.description}
                                  </p>
                                )}
                                {file.url && (
                                  <p className="text-xs text-blue-600 mt-1 ml-6 truncate max-w-md">
                                    {file.url}
                                  </p>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveFile(file.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                 </div>
              )}

              {/* TAB 4: COLLABORATORS */}
              {step === 4 && (
                 <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="grid md:grid-cols-5 gap-6">
                      {/* Left: Collaborator List */}
                      <div className="md:col-span-2 space-y-4">
                        <div className="bg-secondary/20 rounded-lg p-4">
                          <h4 className="font-medium text-sm mb-3">Current Team ({collaborators.length + 1})</h4>

                          {/* Current User */}
                          <div className="flex items-center gap-3 mb-3 pb-3 border-b">
                            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                              {getInitials(CURRENT_USER.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{CURRENT_USER.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{CURRENT_USER.email}</p>
                              <p className="text-xs text-primary">Owner</p>
                            </div>
                          </div>

                          {/* Collaborators */}
                          {collaborators.map((collab, index) => (
                            <div key={index} className="flex items-center gap-3 mb-3">
                              <div className="w-8 h-8 rounded-full bg-secondary text-foreground flex items-center justify-center text-xs font-bold shrink-0">
                                {getInitials(`${collab.firstName} ${collab.lastName}`)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {collab.firstName} {collab.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">{collab.email}</p>
                                <p className="text-xs text-muted-foreground">{collab.role}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive hover:text-destructive shrink-0"
                                onClick={() => handleRemoveCollaborator(collab.email)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}

                          {collaborators.length === 0 && (
                            <p className="text-xs text-muted-foreground text-center py-4">
                              No collaborators added yet
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Add Collaborator Forms */}
                      <div className="md:col-span-3 space-y-6">
                        {/* Add by Email */}
                        <div className="space-y-4 border rounded-lg p-4">
                          <h4 className="font-medium">Add by Email</h4>

                          <div className="grid md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>First Name <span className="text-destructive">*</span></Label>
                              <Input
                                placeholder="John"
                                value={collabFirstName}
                                onChange={(e) => setCollabFirstName(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Last Name <span className="text-destructive">*</span></Label>
                              <Input
                                placeholder="Doe"
                                value={collabLastName}
                                onChange={(e) => setCollabLastName(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Email Address <span className="text-destructive">*</span></Label>
                            <Input
                              type="email"
                              placeholder="collaborator@email.com"
                              value={collabEmail}
                              onChange={(e) => setCollabEmail(e.target.value)}
                            />
                          </div>

                          <Button
                            type="button"
                            variant="secondary"
                            className="w-full gap-2"
                            onClick={handleAddCollaborator}
                          >
                            <Plus className="w-4 h-4" /> Add Collaborator
                          </Button>

                          <p className="text-xs text-muted-foreground">
                            Collaborators will have edit access to this model page.
                          </p>
                        </div>

                        {/* Add Existing Publisher */}
                        <div className="space-y-4 border rounded-lg p-4">
                          <h4 className="font-medium">Add Existing Publisher</h4>

                          <div className="space-y-2">
                            <Label>Select Publisher</Label>
                            <Select value={selectedPublisher} onValueChange={setSelectedPublisher}>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose a publisher..." />
                              </SelectTrigger>
                              <SelectContent>
                                {PUBLISHERS.map((pub) => (
                                  <SelectItem key={pub.id} value={pub.id}>
                                    {pub.name} - {pub.email}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <Button
                            type="button"
                            variant="secondary"
                            className="w-full gap-2"
                            onClick={handleAddPublisher}
                            disabled={!selectedPublisher}
                          >
                            <Plus className="w-4 h-4" /> Add Publisher
                          </Button>
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
           <Button
             onClick={handleNext}
             className="gap-2"
             disabled={step === 4 && !isAllRequiredFieldsComplete()}
           >
              {step === 4 ? "Update Model" : "Next Step"}
              {step !== 4 && <ArrowRight className="w-4 h-4" />}
           </Button>
        </div>

      </div>
    </Layout>
  );
}
