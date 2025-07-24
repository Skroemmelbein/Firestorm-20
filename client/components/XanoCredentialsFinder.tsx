import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ExternalLink,
  CheckCircle,
  Eye,
  Copy,
  ArrowRight,
  Search,
  Key,
  Database,
  Globe,
} from "lucide-react";

export default function XanoCredentialsFinder() {
  const [currentStep, setCurrentStep] = useState(1);
  const [foundCredentials, setFoundCredentials] = useState({
    instanceUrl: false,
    apiKey: false,
    databaseId: false,
  });

  const steps = [
    {
      id: 1,
      title: "Login to Xano",
      icon: Globe,
      description: "Access your Xano workspace",
      action: "Login",
      completed: false,
    },
    {
      id: 2,
      title: "Find Instance URL",
      icon: Globe,
      description: "Copy from browser address bar",
      action: "Copy URL",
      completed: foundCredentials.instanceUrl,
    },
    {
      id: 3,
      title: "Get API Key",
      icon: Key,
      description: "Create or copy from Settings",
      action: "Get Key",
      completed: foundCredentials.apiKey,
    },
    {
      id: 4,
      title: "Find Database ID",
      icon: Database,
      description: "Get from Database settings",
      action: "Find ID",
      completed: foundCredentials.databaseId,
    },
  ];

  const markStepComplete = (stepId: number) => {
    if (stepId === 2) {
      setFoundCredentials((prev) => ({ ...prev, instanceUrl: true }));
    } else if (stepId === 3) {
      setFoundCredentials((prev) => ({ ...prev, apiKey: true }));
    } else if (stepId === 4) {
      setFoundCredentials((prev) => ({ ...prev, databaseId: true }));
    }

    if (stepId < 4) {
      setCurrentStep(stepId + 1);
    }
  };

  const allComplete = Object.values(foundCredentials).every(Boolean);

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="glass-card corp-shadow border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Search className="w-6 h-6 text-blue-600" />
            Find Your Xano Credentials
          </CardTitle>
          <CardDescription>
            Follow these steps to get your Instance URL, API Key, and Database
            ID
          </CardDescription>
          <div className="flex items-center gap-4 mt-4">
            <Badge variant="outline" className="bg-blue-50">
              Step {currentStep} of 4
            </Badge>
            <div className="flex items-center gap-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      step.completed
                        ? "bg-green-500"
                        : step.id === currentStep
                          ? "bg-blue-500"
                          : "bg-gray-300"
                    }`}
                  />
                  {index < steps.length - 1 && (
                    <div
                      className={`w-8 h-0.5 ${
                        step.completed ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Step 1: Login */}
      <Card
        className={`glass-card corp-shadow transition-all ${
          currentStep === 1 ? "border-blue-400 shadow-lg" : "border-gray-200"
        }`}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  currentStep === 1 ? "bg-blue-100" : "bg-gray-100"
                }`}
              >
                <Globe
                  className={`w-5 h-5 ${
                    currentStep === 1 ? "text-blue-600" : "text-gray-600"
                  }`}
                />
              </div>
              <div>
                <CardTitle className="text-lg">Step 1: Login to Xano</CardTitle>
                <CardDescription>
                  Use your credentials to access your workspace
                </CardDescription>
              </div>
            </div>
            {currentStep === 1 && (
              <Badge className="bg-blue-100 text-blue-700">Current</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">URL:</span>
              <span className="text-blue-600">app.xano.com</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Email:</span>
              <span className="font-mono text-sm">
                shannonkroemmelbein@gmail.com
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Password:</span>
              <span className="font-mono text-sm">ga8Q@H4hm@MDT69</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button asChild className="gap-2" disabled={currentStep !== 1}>
              <a href="https://app.xano.com" target="_blank">
                <ExternalLink className="w-4 h-4" />
                Open Xano
              </a>
            </Button>
            <Button
              variant="outline"
              onClick={() => markStepComplete(1)}
              disabled={currentStep !== 1}
            >
              I'm Logged In
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Instance URL */}
      <Card
        className={`glass-card corp-shadow transition-all ${
          currentStep === 2
            ? "border-blue-400 shadow-lg"
            : foundCredentials.instanceUrl
              ? "border-green-400"
              : "border-gray-200"
        }`}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  foundCredentials.instanceUrl
                    ? "bg-green-100"
                    : currentStep === 2
                      ? "bg-blue-100"
                      : "bg-gray-100"
                }`}
              >
                <Globe
                  className={`w-5 h-5 ${
                    foundCredentials.instanceUrl
                      ? "text-green-600"
                      : currentStep === 2
                        ? "text-blue-600"
                        : "text-gray-600"
                  }`}
                />
              </div>
              <div>
                <CardTitle className="text-lg">
                  Step 2: Find Instance URL
                </CardTitle>
                <CardDescription>
                  Copy the workspace URL from your browser
                </CardDescription>
              </div>
            </div>
            {foundCredentials.instanceUrl ? (
              <Badge className="bg-green-100 text-green-700">
                <CheckCircle className="w-3 h-3 mr-1" />
                Found
              </Badge>
            ) : currentStep === 2 ? (
              <Badge className="bg-blue-100 text-blue-700">Current</Badge>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Eye className="h-4 w-4" />
            <AlertDescription>
              <strong>
                Look at your browser address bar after logging in.
              </strong>
              <br />
              Copy everything before "/workspace" (e.g.,
              https://x8ki-letl-twmt.xano.io)
            </AlertDescription>
          </Alert>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="font-medium mb-2">Example URL patterns:</div>
            <div className="space-y-1 text-sm font-mono">
              <div>https://x8ki-letl-twmt.xano.io ✅</div>
              <div>https://app.xano.com ✅</div>
              <div>https://[your-id].xano.io ✅</div>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => markStepComplete(2)}
            disabled={currentStep !== 2}
            className="gap-2"
          >
            <Copy className="w-4 h-4" />I Found the URL
          </Button>
        </CardContent>
      </Card>

      {/* Step 3: API Key */}
      <Card
        className={`glass-card corp-shadow transition-all ${
          currentStep === 3
            ? "border-blue-400 shadow-lg"
            : foundCredentials.apiKey
              ? "border-green-400"
              : "border-gray-200"
        }`}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  foundCredentials.apiKey
                    ? "bg-green-100"
                    : currentStep === 3
                      ? "bg-blue-100"
                      : "bg-gray-100"
                }`}
              >
                <Key
                  className={`w-5 h-5 ${
                    foundCredentials.apiKey
                      ? "text-green-600"
                      : currentStep === 3
                        ? "text-blue-600"
                        : "text-gray-600"
                  }`}
                />
              </div>
              <div>
                <CardTitle className="text-lg">Step 3: Get API Key</CardTitle>
                <CardDescription>
                  Find or create an API key in Settings
                </CardDescription>
              </div>
            </div>
            {foundCredentials.apiKey ? (
              <Badge className="bg-green-100 text-green-700">
                <CheckCircle className="w-3 h-3 mr-1" />
                Found
              </Badge>
            ) : currentStep === 3 ? (
              <Badge className="bg-blue-100 text-blue-700">Current</Badge>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="font-medium mb-2">🔍 Where to find it:</div>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Look for "Settings" in the left sidebar</li>
                <li>Click on "API Keys" or "Authentication"</li>
                <li>Copy existing key OR create new one</li>
                <li>If creating new: enable all permissions</li>
              </ol>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="font-medium mb-2">API Key format:</div>
              <div className="font-mono text-sm break-all">
                xano_api_1234567890abcdefghijklmnop...
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => markStepComplete(3)}
            disabled={currentStep !== 3}
            className="gap-2"
          >
            <Key className="w-4 h-4" />I Have the API Key
          </Button>
        </CardContent>
      </Card>

      {/* Step 4: Database ID */}
      <Card
        className={`glass-card corp-shadow transition-all ${
          currentStep === 4
            ? "border-blue-400 shadow-lg"
            : foundCredentials.databaseId
              ? "border-green-400"
              : "border-gray-200"
        }`}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  foundCredentials.databaseId
                    ? "bg-green-100"
                    : currentStep === 4
                      ? "bg-blue-100"
                      : "bg-gray-100"
                }`}
              >
                <Database
                  className={`w-5 h-5 ${
                    foundCredentials.databaseId
                      ? "text-green-600"
                      : currentStep === 4
                        ? "text-blue-600"
                        : "text-gray-600"
                  }`}
                />
              </div>
              <div>
                <CardTitle className="text-lg">
                  Step 4: Find Database ID
                </CardTitle>
                <CardDescription>
                  Get the numeric ID from your database
                </CardDescription>
              </div>
            </div>
            {foundCredentials.databaseId ? (
              <Badge className="bg-green-100 text-green-700">
                <CheckCircle className="w-3 h-3 mr-1" />
                Found
              </Badge>
            ) : currentStep === 4 ? (
              <Badge className="bg-blue-100 text-blue-700">Current</Badge>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="font-medium mb-2">🔍 Two ways to find it:</div>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Method 1 - From URL:</strong>
                </div>
                <ol className="list-decimal list-inside ml-4 space-y-1">
                  <li>Click "Database" in left sidebar</li>
                  <li>Look at URL: .../database/123456</li>
                  <li>The number after "/database/" is your ID</li>
                </ol>

                <div>
                  <strong>Method 2 - From Settings:</strong>
                </div>
                <ol className="list-decimal list-inside ml-4 space-y-1">
                  <li>Go to Database section</li>
                  <li>Click settings/gear icon</li>
                  <li>Look for "Database ID" field</li>
                </ol>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="font-medium mb-2">Database ID format:</div>
              <div className="font-mono text-sm">123456 (just numbers)</div>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => markStepComplete(4)}
            disabled={currentStep !== 4}
            className="gap-2"
          >
            <Database className="w-4 h-4" />I Found the Database ID
          </Button>
        </CardContent>
      </Card>

      {/* Completion */}
      {allComplete && (
        <Card className="glass-card corp-shadow border-green-400 bg-gradient-to-r from-green-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-green-800">
              <CheckCircle className="w-6 h-6" />
              🎉 All Credentials Found!
            </CardTitle>
            <CardDescription>
              Now you can enter these in the integration form and test your
              connection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <div className="font-medium mb-2">✅ You should now have:</div>
                <div className="space-y-1 text-sm">
                  <div>• Instance URL (https://....xano.io)</div>
                  <div>• API Key (xano_api_...)</div>
                  <div>• Database ID (numeric)</div>
                </div>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Next:</strong> Go back to the integration form, enter
                  these credentials, and click "Test Connection"
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
