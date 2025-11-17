export async function LoadPaths(team: string): Promise<Response> {
  return Response.json({
    team,
    paths: [
      {
        name: 'Example Path',
        points: [
          { x: 0, y: 0 },
          { x: 1, y: 1 },
          { x: 2, y: 0 },
        ],
      },
      {
        name: 'Another Path',
        points: [
          { x: 0, y: 1 },
          { x: 1, y: 0 },
          { x: 2, y: 1 },
        ],
      },
    ],
  });
}
