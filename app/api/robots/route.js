// app/api/robots/route.js

export const GET = async (req) => {
    const robots = `User-agent: *
    Allow: /
  
    Sitemap: https://asbible.com/api/sitemap`;
  
    return new Response(robots, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  };
  