import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "fktmtrlizimldozsggdz.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "www.pedreiras.ma.gov.br",
      },
      {
        protocol: "https",
        hostname: "pedreiras.ma.gov.br",
      },
    ],
  },
};

export default nextConfig;
