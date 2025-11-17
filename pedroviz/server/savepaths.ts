export function SavePaths(team: string, data: string): Response {
  return Response.json({
    message: `Data received for ${team}: ${data}`,
  });
}
