import { IncomingMessage, ServerResponse } from "http";

type RequestHandler = (req: IncomingMessage, res: ServerResponse<IncomingMessage>, pathParams: Record<string, string>) => Promise<void>;

type HTTPMethod = "GET" | "PUT" | "POST" | "DELETE";

export type { HTTPMethod, RequestHandler };
