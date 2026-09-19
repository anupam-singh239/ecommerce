import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

function ShoppingFooter() {
  const navigate = useNavigate();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="bg-[#07142f] text-white">

      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-6 py-16">

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div>
            <div
              onClick={() => navigate("/")}
              className="mb-5 flex cursor-pointer items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl font-black text-[#07142f]">
                E
              </div>

              <div>
                <h2 className="text-2xl font-extrabold">
                  Ecommerce
                </h2>

                <p className="text-xs tracking-[3px] text-blue-300">
                  SHOP SMART
                </p>
              </div>
            </div>

            <p className="max-w-sm leading-7 text-gray-300">
              Discover premium products, trending styles and
              exclusive deals — all in one place.
            </p>

            <div className="mt-7 flex gap-3">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 transition hover:bg-white hover:text-[#07142f]"
              >
                <Instagram size={18} />
              </a>

              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 transition hover:bg-white hover:text-[#07142f]"
              >
                <Facebook size={18} />
              </a>

              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 transition hover:bg-white hover:text-[#07142f]"
              >
                <Twitter size={18} />
              </a>

              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 transition hover:bg-white hover:text-[#07142f]"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-6 text-lg font-bold">
              Quick Links
            </h3>

            <div className="space-y-4 text-gray-300">

              <button
                onClick={() => navigate("/")}
                className="block transition hover:translate-x-1 hover:text-white"
              >
                Home
              </button>

              <button
                onClick={() => navigate("/shop/listing")}
                className="block transition hover:translate-x-1 hover:text-white"
              >
                All Products
              </button>

              <button
                onClick={() => navigate("/shop/listing")}
                className="block transition hover:translate-x-1 hover:text-white"
              >
                Men's Collection
              </button>

              <button
                onClick={() => navigate("/shop/listing")}
                className="block transition hover:translate-x-1 hover:text-white"
              >
                Women's Collection
              </button>

              <button
                onClick={() => navigate("/shop/listing")}
                className="block transition hover:translate-x-1 hover:text-white"
              >
                Latest Products
              </button>

            </div>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="mb-6 text-lg font-bold">
              Customer Service
            </h3>

            <div className="space-y-4 text-gray-300">

              <button className="block transition hover:translate-x-1 hover:text-white">
                Help Center
              </button>

              <button className="block transition hover:translate-x-1 hover:text-white">
                Shipping & Delivery
              </button>

              <button className="block transition hover:translate-x-1 hover:text-white">
                Returns & Refunds
              </button>

              <button className="block transition hover:translate-x-1 hover:text-white">
                Privacy Policy
              </button>

              <button className="block transition hover:translate-x-1 hover:text-white">
                Terms & Conditions
              </button>

            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-6 text-lg font-bold">
              Contact Us
            </h3>

            <div className="space-y-5">

              {/* Email */}
              <a
                href="mailto:anupamsssingh123@gmail.com"
                className="flex items-start gap-3 text-gray-300 transition hover:text-white"
              >
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Mail size={17} />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400">
                    Email
                  </p>

                  <p className="mt-1 break-all text-sm">
                    anupamsssingh123@gmail.com
                  </p>
                </div>
              </a>

              {/* Phone */}
              <a
                href="tel:7223806163"
                className="flex items-start gap-3 text-gray-300 transition hover:text-white"
              >
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Phone size={17} />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400">
                    Phone
                  </p>

                  <p className="mt-1 text-sm">
                    +91 72238 06163
                  </p>
                </div>
              </a>

              {/* Location */}
              <div className="flex items-start gap-3 text-gray-300">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <MapPin size={17} />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400">
                    Location
                  </p>

                  <p className="mt-1 text-sm">
                    Madhya Pradesh, India
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Footer CTA */}
        <div className="mt-14 rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">

          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">

            <div>
              <p className="text-sm font-semibold uppercase tracking-[3px] text-blue-300">
                Stay Updated
              </p>

              <h3 className="mt-2 text-2xl font-bold">
                Don't miss our latest deals.
              </h3>

              <p className="mt-2 text-sm text-gray-400">
                New products, special offers and exclusive updates.
              </p>
            </div>

            <button
              onClick={() => navigate("/shop/listing")}
              className="group flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-[#07142f] transition hover:scale-105"
            >
              Explore Products

              <ArrowUpRight
                size={18}
                className="transition group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </button>

          </div>

        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 text-sm text-gray-400 md:flex-row">

          <p className="text-center md:text-left">
            © {new Date().getFullYear()} Ecommerce. All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            <span>
              Secure Shopping
            </span>

            <span className="hidden h-1 w-1 rounded-full bg-gray-500 md:block" />

            <span>
              Made with ❤️ in India
            </span>
          </div>

          <button
            onClick={scrollToTop}
            className="font-semibold text-white transition hover:text-blue-300"
          >
            Back to Top ↑
          </button>

        </div>

      </div>

    </footer>
  );
}

export default ShoppingFooter;