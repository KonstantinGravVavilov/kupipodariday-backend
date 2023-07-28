export interface ReqWithUser extends Request {
  user: {
    id: number;
    username: string;
  };
}
