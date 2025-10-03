export interface RepoForm {
  username: string;
  repoName: string;
  accessToken: string;
}

export interface GitHubRepo {
  name: string;
  description: string;
  default_branch: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  language: string;
  private: boolean;
  created_at: string;
  updated_at: string;
}

export interface GitHubBranch {
  name: string;
  protected: boolean;
}

export interface GitHubTreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
}

export interface FileContent {
  content: string;
  encoding: string;
  name: string;
  path: string;
  sha: string;
  size: number;
  type: string;
  download_url: string;
}

export interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
  loading?: boolean;
}