/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Allow access from ngrok, local network IPs, and any device on your network
  allowedDevOrigins: [
    "*.ngrok-free.app",
    "*.ngrok.io",
    "192.168.*.*",
    "10.*.*.*",
    "172.16.*.*",
    "localhost",
    "127.0.0.1",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "source.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "*.supabase.co" }
    ]
  }
};

export default nextConfig;
