interface ExecutionResult {
  success: boolean;
  message: string;
  filePath?: string;
  error?: string;
}

export class VoiceFileManager {
  async createComponent(name: string, code: string): Promise<ExecutionResult> {
    try {
      const fileName = `client/components/${name}.tsx`;

      // Since we can't directly call Write from the frontend,
      // we'll send this to our backend API
      const response = await fetch("/api/create-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName,
          content: code,
          type: "component",
        }),
      });

      if (response.ok) {
        return {
          success: true,
          message: `Created component: ${fileName}`,
          filePath: fileName,
        };
      } else {
        const error = await response.text();
        return {
          success: false,
          message: "Failed to create component",
          error,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "Failed to create component",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async createPage(name: string, code: string): Promise<ExecutionResult> {
    try {
      const fileName = `client/pages/${name}.tsx`;

      const response = await fetch("/api/create-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName,
          content: code,
          type: "page",
        }),
      });

      if (response.ok) {
        return {
          success: true,
          message: `Created page: ${fileName}`,
          filePath: fileName,
        };
      } else {
        const error = await response.text();
        return {
          success: false,
          message: "Failed to create page",
          error,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "Failed to create page",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async createAPI(name: string, code: string): Promise<ExecutionResult> {
    try {
      const fileName = `server/routes/${name}.ts`;

      const response = await fetch("/api/create-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName,
          content: code,
          type: "api",
        }),
      });

      if (response.ok) {
        return {
          success: true,
          message: `Created API: ${fileName}`,
          filePath: fileName,
        };
      } else {
        const error = await response.text();
        return {
          success: false,
          message: "Failed to create API",
          error,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "Failed to create API",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

export const voiceFileManager = new VoiceFileManager();
