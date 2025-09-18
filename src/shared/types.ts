export type VideoItem = {
  id: string;
  title: string;
  thumbnailUrl: string;
  duration: number;
  views: number;
  createdAt: string;
  tags: Tag[];
};

export type Tag = {
  id: string;
  name: string;
  color: string;
};

export enum SortKey {
  Newest = "newest",
  Oldest = "oldest",
  MostViews = "most-views",
  LeastViews = "least-views",
}