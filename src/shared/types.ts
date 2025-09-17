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
