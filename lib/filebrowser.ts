/**
 * Filebrowser API Service
 * Handles authentication and file operations with your self-hosted Filebrowser instance
 */

export interface FilebrowserConfig {
  baseUrl: string;
  username?: string;
  password?: string;
  token?: string;
  fallbackImages?: string[];
}

export interface FilebrowserFile {
  name: string;
  size: number;
  path: string;
  type: string;
  modified: string;
  isDir: boolean;
  url?: string;
}

export interface PhotoResponse {
  id: string;
  url: string;
  uploadedAt: string;
  name: string;
  size: number;
}

/**
 * Filebrowser API Client
 */
export class FilebrowserClient {
  private config: FilebrowserConfig;
  private authToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(config: FilebrowserConfig) {
    this.config = config;
    if (config.token) {
      this.authToken = config.token;
    }
  }

  /**
   * Authenticate with Filebrowser using username/password
   * Returns an auth token that's cached for subsequent requests
   */
  private async authenticate(): Promise<string> {
    // If we have a pre-configured token, use it
    if (this.config.token) {
      return this.config.token;
    }

    // Check if we have a valid cached token
    if (this.authToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.authToken;
    }

    if (!this.config.username || !this.config.password) {
      throw new Error('Filebrowser credentials not configured');
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.config.username,
          password: this.config.password,
          recaptcha: '', // Not needed for self-hosted
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
      }

      const token = await response.text();
      this.authToken = token;
      // Cache token for 23 hours (Filebrowser tokens typically expire in 24h)
      this.tokenExpiry = Date.now() + 23 * 60 * 60 * 1000;

      return token;
    } catch (error) {
      console.error('Filebrowser authentication error:', error);
      throw error;
    }
  }

  /**
   * Fetch files from a specific directory
   * @param path - Path to directory (e.g., "/my_data/portfolio_pics")
   */
  async listFiles(path: string): Promise<FilebrowserFile[]> {
    try {
      const token = await this.authenticate();

      // Filebrowser API endpoint for listing directory contents
      const encodedPath = encodeURIComponent(path);
      const response = await fetch(
        `${this.config.baseUrl}/api/resources${path}`,
        {
          method: 'GET',
          headers: {
            'X-Auth': token,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to list files: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Filebrowser returns directory info with items array
      if (data.items && Array.isArray(data.items)) {
        return data.items.filter((item: FilebrowserFile) => !item.isDir);
      }

      return [];
    } catch (error) {
      console.error('Error listing Filebrowser files:', error);
      throw error;
    }
  }

  /**
   * Generate a public download URL for a file
   * Note: This requires authentication and is temporary unless using public shares
   */
  async getFileUrl(path: string): Promise<string> {
    const token = await this.authenticate();
    return `${this.config.baseUrl}/api/raw${path}?auth=${token}`;
  }

  /**
   * Get all image files from portfolio directory
   * Maps to the format expected by your frontend
   */
  async getPortfolioPhotos(directoryPath: string = '/my_data/portfolio_pics'): Promise<PhotoResponse[]> {
    try {
      const files = await this.listFiles(directoryPath);

      // Filter for image files only
      const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i;
      const imageFiles = files.filter((file) => imageExtensions.test(file.name));

      // Map to frontend-friendly format
      const photos: PhotoResponse[] = await Promise.all(
        imageFiles.map(async (file) => {
          const url = await this.getFileUrl(file.path);
          return {
            id: file.path,
            url: url,
            uploadedAt: file.modified,
            name: file.name,
            size: file.size,
          };
        })
      );

      // Sort by upload date (newest first)
      photos.sort((a, b) => 
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );

      return photos;
    } catch (error) {
      console.error('Error fetching portfolio photos:', error);
      throw error;
    }
  }

  /**
   * Create a public share for a folder (alternative to authentication)
   * This allows you to share the entire portfolio_pics folder publicly
   */
  async createPublicShare(path: string, expiresInDays?: number): Promise<string> {
    try {
      const token = await this.authenticate();

      const shareData: any = {
        path: path,
        // expires: expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString() : null,
      };

      const response = await fetch(`${this.config.baseUrl}/api/share${path}`, {
        method: 'POST',
        headers: {
          'X-Auth': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shareData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create share: ${response.status}`);
      }

      const data = await response.json();
      // Returns share hash that can be used in URLs
      return `${this.config.baseUrl}/share/${data.hash}`;
    } catch (error) {
      console.error('Error creating public share:', error);
      throw error;
    }
  }

  /**
   * List files from a public share (no authentication needed)
   * Use this if you've created a persistent share for your portfolio folder
   */
  static async listPublicShareFiles(shareUrl: string): Promise<FilebrowserFile[]> {
    try {
      // Extract hash from share URL
      const hash = shareUrl.split('/share/')[1];
      const baseUrl = shareUrl.split('/share/')[0];

      const response = await fetch(`${baseUrl}/api/public/share/${hash}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch public share: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.items && Array.isArray(data.items)) {
        return data.items.filter((item: FilebrowserFile) => !item.isDir);
      }

      return [];
    } catch (error) {
      console.error('Error fetching public share files:', error);
      throw error;
    }
  }

  /**
   * Get public share download URLs (no auth required)
   */
  static getPublicShareFileUrl(baseUrl: string, hash: string, filename: string): string {
    return `${baseUrl}/api/public/dl/${hash}/${encodeURIComponent(filename)}`;
  }

  /**
   * Health check - verify Filebrowser is accessible
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch (error) {
      console.error('Filebrowser health check failed:', error);
      return false;
    }
  }
}

/**
 * Utility function to get fallback images when Filebrowser is offline
 */
export function getFallbackImages(fallbackList?: string[]): PhotoResponse[] {
  const defaultFallbacks = fallbackList || [
    '/placeholder.jpg',
    '/images/aarush-photo.png',
  ];

  return defaultFallbacks.map((url, index) => ({
    id: `fallback-${index}`,
    url: url,
    uploadedAt: new Date().toISOString(),
    name: `fallback-${index}`,
    size: 0,
  }));
}

