/**
 * Type definitions for Filebrowser API responses
 */

export interface FilebrowserLoginRequest {
  username: string;
  password: string;
  recaptcha: string;
}

export interface FilebrowserResource {
  name: string;
  size: number;
  path: string;
  type: string;
  modified: string;
  isDir: boolean;
  mode: number;
  extension?: string;
}

export interface FilebrowserDirectoryResponse {
  items: FilebrowserResource[];
  numDirs: number;
  numFiles: number;
  path: string;
  size: number;
}

export interface FilebrowserShareRequest {
  path: string;
  expires?: string; // ISO 8601 date string
  password?: string;
}

export interface FilebrowserShareResponse {
  hash: string;
  path: string;
  expires?: string;
  url?: string;
}

export interface FilebrowserPublicShareResponse {
  items: FilebrowserResource[];
  path: string;
}

export interface FilebrowserUserInfo {
  id: number;
  username: string;
  scope: string;
  locale: string;
  viewMode: string;
  perm: {
    admin: boolean;
    execute: boolean;
    create: boolean;
    rename: boolean;
    modify: boolean;
    delete: boolean;
    share: boolean;
    download: boolean;
  };
}

export interface FilebrowserSettings {
  signup: boolean;
  createUserDir: boolean;
  defaults: {
    scope: string;
    locale: string;
    viewMode: string;
  };
}

