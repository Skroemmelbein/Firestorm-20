import fetch from "node-fetch";

interface UnsplashConfig {
  accessKey: string;
}

interface PexelsConfig {
  apiKey: string;
}

interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export interface AssetReactorConfig {
  unsplash: UnsplashConfig;
  pexels: PexelsConfig;
  cloudinary: CloudinaryConfig;
}

export interface GeneratedAsset {
  type: 'image' | 'video' | 'gif';
  url: string;
  originalUrl?: string;
  width?: number;
  height?: number;
  description?: string;
  source: 'unsplash' | 'pexels' | 'cloudinary';
}

export class AssetReactor {
  private config: AssetReactorConfig;

  constructor(config: AssetReactorConfig) {
    this.config = config;
  }

  async getRandomHeroImage(query?: string, width = 1200, height = 630): Promise<GeneratedAsset> {
    try {
      const params = new URLSearchParams({
        client_id: this.config.unsplash.accessKey,
        w: width.toString(),
        h: height.toString(),
        fit: 'crop',
        crop: 'entropy'
      });

      if (query) {
        params.append('query', query);
      }

      const response = await fetch(`https://api.unsplash.com/photos/random?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Unsplash API Error ${response.status}: ${await response.text()}`);
      }

      const data = await response.json() as any;

      return {
        type: 'image',
        url: data.urls.custom || data.urls.regular,
        originalUrl: data.urls.raw,
        width: data.width,
        height: data.height,
        description: data.description || data.alt_description,
        source: 'unsplash'
      };
    } catch (error) {
      console.error('Failed to fetch Unsplash image:', error);
      throw error;
    }
  }

  async getVideoForMMS(query: string, duration = 'short'): Promise<GeneratedAsset> {
    try {
      const params = new URLSearchParams({
        query,
        per_page: '1',
        size: 'medium' // Suitable for MMS
      });

      const response = await fetch(`https://api.pexels.com/videos/search?${params.toString()}`, {
        headers: {
          'Authorization': this.config.pexels.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Pexels API Error ${response.status}: ${await response.text()}`);
      }

      const data = await response.json() as any;

      if (!data.videos || data.videos.length === 0) {
        throw new Error('No videos found for query');
      }

      const video = data.videos[0];
      const videoFile = video.video_files.find((file: any) => 
        file.quality === 'sd' && file.file_type === 'video/mp4'
      ) || video.video_files[0];

      return {
        type: 'video',
        url: videoFile.link,
        width: videoFile.width,
        height: videoFile.height,
        description: `Video: ${query}`,
        source: 'pexels'
      };
    } catch (error) {
      console.error('Failed to fetch Pexels video:', error);
      throw error;
    }
  }

  generateCloudinaryUrl(
    publicId: string,
    options: {
      text?: string;
      textColor?: string;
      textSize?: number;
      textFont?: string;
      width?: number;
      height?: number;
      crop?: string;
      effects?: string[];
    } = {}
  ): string {
    const {
      text,
      textColor = 'white',
      textSize = 60,
      textFont = 'Arial',
      width = 1200,
      height = 630,
      crop = 'fill',
      effects = []
    } = options;

    let transformations: string[] = [];

    transformations.push(`c_${crop},w_${width},h_${height}`);

    if (effects.length > 0) {
      transformations.push(...effects);
    }

    if (text) {
      const encodedText = encodeURIComponent(text);
      transformations.push(`l_text:${textFont}_${textSize}:${encodedText},co_${textColor},g_center`);
    }

    const transformString = transformations.join(',');
    return `https://res.cloudinary.com/${this.config.cloudinary.cloudName}/image/upload/${transformString}/${publicId}`;
  }

  async generateHeroWithText(
    text: string,
    query?: string,
    options: {
      textColor?: string;
      textSize?: number;
      effects?: string[];
    } = {}
  ): Promise<GeneratedAsset> {
    try {
      const baseImage = await this.getRandomHeroImage(query);
      
      const samplePublicId = 'sample';
      
      const heroUrl = this.generateCloudinaryUrl(samplePublicId, {
        text,
        textColor: options.textColor,
        textSize: options.textSize,
        effects: options.effects
      });

      return {
        type: 'image',
        url: heroUrl,
        originalUrl: baseImage.url,
        width: 1200,
        height: 630,
        description: `Hero image: ${text}`,
        source: 'cloudinary'
      };
    } catch (error) {
      console.error('Failed to generate hero with text:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<{
    unsplash: boolean;
    pexels: boolean;
    cloudinary: boolean;
  }> {
    const results = {
      unsplash: false,
      pexels: false,
      cloudinary: true // Cloudinary is URL-based, assume working
    };

    try {
      const unsplashResponse = await fetch(`https://api.unsplash.com/photos/random?client_id=${this.config.unsplash.accessKey}&count=1`);
      results.unsplash = unsplashResponse.ok;
    } catch (error) {
      console.error('Unsplash health check failed:', error);
    }

    try {
      const pexelsResponse = await fetch('https://api.pexels.com/v1/search?query=test&per_page=1', {
        headers: { 'Authorization': this.config.pexels.apiKey }
      });
      results.pexels = pexelsResponse.ok;
    } catch (error) {
      console.error('Pexels health check failed:', error);
    }

    return results;
  }
}

// Export singleton instance
let assetReactor: AssetReactor | null = null;

export function initializeAssetReactor(config: AssetReactorConfig): AssetReactor {
  assetReactor = new AssetReactor(config);
  return assetReactor;
}

export function getAssetReactor(): AssetReactor {
  if (!assetReactor) {
    throw new Error(
      "Asset Reactor not initialized. Please configure API credentials first."
    );
  }
  return assetReactor;
}

export default AssetReactor;
