export interface JwtPayload {
  sub: string; // user ID
  email: string;
}

export interface UserPayload {
  userId: string;
  email: string;
}

export interface LoginResponse {
  access_token: string;
}
