import { Outlet } from "react-router-dom";
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  Star,
} from "lucide-react";

function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#eef5ff] flex items-center justify-center p-0 lg:p-7">

      <div className="
        w-full
        max-w-[1650px]
        h-screen
        lg:h-[calc(100vh-56px)]
        overflow-hidden
        bg-white
        lg:rounded-[28px]
        shadow-[0_25px_70px_rgba(20,60,120,0.16)]
        grid
        lg:grid-cols-[62%_38%]
      ">

        {/* ================= LEFT ================= */}

        <section className="
          relative
          overflow-hidden
          bg-gradient-to-br
          from-[#061b4b]
          via-[#092f73]
          to-[#075bcf]
        ">

          {/* Background circle 1 */}
          <div className="
            absolute
            -top-[300px]
            -left-[300px]
            w-[780px]
            h-[780px]
            rounded-full
            border-[120px]
            border-blue-300/10
          " />

          {/* Background circle 2 */}
          <div className="
            absolute
            -bottom-[420px]
            -right-[300px]
            w-[900px]
            h-[900px]
            rounded-full
            border-[120px]
            border-blue-300/10
          " />

          {/* Glow */}
          <div className="
            absolute
            right-[80px]
            top-[300px]
            w-[550px]
            h-[550px]
            rounded-full
            bg-blue-400/10
            blur-[80px]
          " />

          {/* Dots */}
          <div className="absolute top-16 right-12 grid grid-cols-5 gap-3 opacity-40">
            {Array.from({ length: 25 }).map((_, i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-blue-300"
              />
            ))}
          </div>

          <div className="relative z-10 h-full px-12 xl:px-16 py-9">

            {/* LOGO */}

            <div className="flex items-center gap-4">

              <div className="
                w-16
                h-16
                rounded-2xl
                bg-white
                flex
                items-center
                justify-center
                shadow-xl
              ">
                <ShoppingBag className="w-9 h-9 text-[#082b70]" />
              </div>

              <div>
                <h1 className="text-[30px] font-extrabold text-white">
                  Ecommerce
                </h1>

                <p className="
                  text-[11px]
                  tracking-[0.32em]
                  text-blue-300
                  uppercase
                ">
                  Modern Shopping
                </p>
              </div>

            </div>

            {/* MAIN CONTENT */}

            <div className="relative mt-14 h-[650px]">

              {/* TEXT */}

              <div className="absolute left-0 top-0 z-30">

                <h2 className="
                  text-[58px]
                  xl:text-[70px]
                  leading-[0.98]
                  font-extrabold
                  text-white
                ">
                  Shop More
                </h2>

                <h2 className="
                  text-[58px]
                  xl:text-[70px]
                  leading-[0.98]
                  font-extrabold
                  text-[#63a5ff]
                ">
                  Save More
                </h2>

                <p className="
                  mt-7
                  max-w-[440px]
                  text-[18px]
                  leading-8
                  text-blue-100/85
                ">
                  Discover amazing products, exclusive offers
                  and a better shopping experience.
                </p>

              </div>

              {/* ================= LARGE IMAGE ================= */}

              <div className="
                absolute
                z-20
                right-[-20px]
                xl:right-[-10px]
                top-[10px]
                w-[58%]
                h-[520px]
                flex
                items-center
                justify-center
              ">

                <div className="
                  absolute
                  w-[500px]
                  h-[500px]
                  rounded-full
                  bg-blue-400/15
                  blur-[70px]
                " />

                <img
                  src="/shopping-cart.png"
                  alt="Shopping"
                  className="
                    relative
                    z-10
                    w-[520px]
                    h-[520px]
                    xl:w-[590px]
                    xl:h-[590px]
                    object-contain
                    scale-110
                    drop-shadow-[0_25px_35px_rgba(0,0,0,0.28)]
                  "
                />

              </div>

              {/* BENEFITS */}

              <div className="
                absolute
                left-0
                bottom-[25px]
                z-30
                flex
                gap-14
              ">

                {/* Secure */}

                <div>
                  <div className="
                    w-14
                    h-14
                    rounded-full
                    bg-blue-500/30
                    flex
                    items-center
                    justify-center
                    mb-3
                  ">
                    <ShieldCheck className="w-7 h-7 text-white" />
                  </div>

                  <p className="font-bold text-white">
                    Secure
                  </p>

                  <p className="text-sm text-blue-100/80">
                    Payments
                  </p>
                </div>

                {/* Delivery */}

                <div>
                  <div className="
                    w-14
                    h-14
                    rounded-full
                    bg-blue-500/30
                    flex
                    items-center
                    justify-center
                    mb-3
                  ">
                    <Truck className="w-7 h-7 text-white" />
                  </div>

                  <p className="font-bold text-white">
                    Fast
                  </p>

                  <p className="text-sm text-blue-100/80">
                    Delivery
                  </p>
                </div>

                {/* Deals */}

                <div>
                  <div className="
                    w-14
                    h-14
                    rounded-full
                    bg-blue-500/30
                    flex
                    items-center
                    justify-center
                    mb-3
                  ">
                    <Star className="w-7 h-7 text-white" />
                  </div>

                  <p className="font-bold text-white">
                    Best
                  </p>

                  <p className="text-sm text-blue-100/80">
                    Deals
                  </p>
                </div>

              </div>

            </div>

            {/* FOOTER */}

            <div className="
              absolute
              bottom-7
              left-12
              right-12
              flex
              justify-between
              text-xs
              text-blue-200/60
            ">
              <span>Your Shopping Partner</span>
              <span>© 2026 Ecommerce</span>
            </div>

          </div>
        </section>


        {/* ================= RIGHT LOGIN ================= */}

        <section className="
          bg-white
          flex
          items-start
          justify-center
          px-10
          sm:px-14
          lg:px-12
          xl:px-16
          pt-16
        ">

          <div className="w-full max-w-[520px]">
            <Outlet />
          </div>

        </section>

      </div>

    </div>
  );
}

export default AuthLayout;