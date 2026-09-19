import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

function PayPalButton({ orderData, onSuccess }) {
  const paypalRef = useRef(null);
  const buttonsRef = useRef(null);
  const mountedRef = useRef(true);

  const [loading, setLoading] = useState(true);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  // ==========================================
  // LOAD PAYPAL SDK
  // ==========================================

  useEffect(() => {
    mountedRef.current = true;

    if (!PAYPAL_CLIENT_ID) {
      console.error("VITE_PAYPAL_CLIENT_ID is missing");

      setLoading(false);

      return;
    }

    console.log("PAYPAL CLIENT ID: FOUND");

    // Already loaded
    if (window.paypal) {
      console.log("PayPal SDK already available");

      setSdkLoaded(true);
      setLoading(false);

      return;
    }

    // Check existing script
    const existingScript = document.querySelector(
      'script[src*="paypal.com/sdk/js"]'
    );

    if (existingScript) {
      const handleLoad = () => {
        console.log("PayPal SDK loaded successfully");

        if (mountedRef.current) {
          setSdkLoaded(true);
          setLoading(false);
        }
      };

      existingScript.addEventListener("load", handleLoad);

      return () => {
        mountedRef.current = false;

        existingScript.removeEventListener(
          "load",
          handleLoad
        );
      };
    }

    // Create SDK script
    const script = document.createElement("script");

    script.src =
      `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
        PAYPAL_CLIENT_ID
      )}` +
      `&currency=USD` +
      `&intent=capture` +
      `&components=buttons`;

    script.async = true;

    script.onload = () => {
      console.log("PayPal SDK loaded successfully");

      if (mountedRef.current) {
        setSdkLoaded(true);
        setLoading(false);
      }
    };

    script.onerror = () => {
      console.error("PayPal SDK failed to load");

      if (mountedRef.current) {
        setLoading(false);

        toast({
          title: "PayPal Error",
          description:
            "PayPal payment system could not be loaded.",
          variant: "destructive",
        });
      }
    };

    document.body.appendChild(script);

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ==========================================
  // RENDER PAYPAL BUTTONS
  // ==========================================

  useEffect(() => {
    if (
      !sdkLoaded ||
      !window.paypal ||
      !paypalRef.current
    ) {
      return;
    }

    const container = paypalRef.current;

    if (!container || !container.isConnected) {
      return;
    }

    // Remove previous buttons
    if (buttonsRef.current) {
      try {
        buttonsRef.current.close();
      } catch (error) {
        console.log(
          "PayPal previous button cleanup:",
          error
        );
      }

      buttonsRef.current = null;
    }

    container.innerHTML = "";

    console.log("Rendering PayPal buttons...");

    // ==========================================
    // PAYPAL BUTTON
    // ==========================================

    const buttons = window.paypal.Buttons({
      style: {
        layout: "vertical",
        color: "gold",
        shape: "rect",
        label: "paypal",
        height: 45,
      },

      // ==========================================
      // CREATE PAYPAL ORDER
      // ==========================================

      createOrder: async () => {
        try {
          console.log("Creating PayPal order...");

          console.log(
            "PAYPAL ORDER DATA:",
            orderData
          );

          const addressInfo =
            orderData?.addressInfo || {};

          // ==========================================
          // ADDRESS CHECK
          // ==========================================

          if (
            !addressInfo.address ||
            !addressInfo.city ||
            !addressInfo.pincode ||
            !addressInfo.phone
          ) {
            toast({
              title: "Address Required",
              description:
                "Please select a complete delivery address before paying.",
              variant: "destructive",
            });

            throw new Error(
              "Complete delivery address is required."
            );
          }

          // ==========================================
          // SEND TO BACKEND
          // ==========================================

          const response = await axios.post(
            "https://ecommerce-h0hd.onrender.com/api/shop/order/paypal/create",
            orderData,
            {
              withCredentials: true,
            }
          );

          console.log(
            "PayPal create response:",
            response.data
          );

          if (!response.data?.success) {
            throw new Error(
              response.data?.message ||
                "Failed to create PayPal order"
            );
          }

          const paypalOrderId =
            response.data?.paypalOrderId;

          const localOrderId =
            response.data?.localOrderId;

          if (!paypalOrderId) {
            throw new Error(
              "PayPal Order ID was not returned."
            );
          }

          if (!localOrderId) {
            throw new Error(
              "Local Order ID was not returned."
            );
          }

          console.log(
            "PayPal Order ID:",
            paypalOrderId
          );

          console.log(
            "Local Order ID:",
            localOrderId
          );

          // ==========================================
          // SAVE LOCAL ORDER ID
          // ==========================================

          sessionStorage.setItem(
            "paypalLocalOrderId",
            localOrderId.toString()
          );

          return paypalOrderId;
        } catch (error) {
          console.error(
            "PayPal create order error:",
            error
          );

          toast({
            title: "PayPal Order Failed",
            description:
              error?.response?.data?.message ||
              error?.message ||
              "Unable to create PayPal order.",
            variant: "destructive",
          });

          throw error;
        }
      },

      // ==========================================
      // PAYMENT APPROVED
      // ==========================================

      onApprove: async (data) => {
        try {
          console.log(
            "PayPal payment approved:",
            data
          );

          const paypalOrderId =
            data?.orderID;

          if (!paypalOrderId) {
            throw new Error(
              "PayPal Order ID is missing."
            );
          }

          // ==========================================
          // GET LOCAL ORDER ID
          // ==========================================

          const localOrderId =
            sessionStorage.getItem(
              "paypalLocalOrderId"
            );

          console.log(
            "Local Order ID for capture:",
            localOrderId
          );

          if (!localOrderId) {
            throw new Error(
              "Local order ID not found."
            );
          }

          // ==========================================
          // CAPTURE PAYMENT
          // ==========================================

          console.log(
            "Capturing PayPal payment..."
          );

          const response = await axios.post(
            "https://ecommerce-h0hd.onrender.com/api/shop/order/capture",
            {
              paypalOrderId,
              localOrderId,
            },
            {
              withCredentials: true,
            }
          );

          console.log(
            "PayPal capture response:",
            response.data
          );

          if (!response.data?.success) {
            throw new Error(
              response.data?.message ||
                "Payment capture failed"
            );
          }

          // ==========================================
          // REMOVE SESSION ORDER ID
          // ==========================================

          sessionStorage.removeItem(
            "paypalLocalOrderId"
          );

          // ==========================================
          // SAVE CURRENT ORDER
          // ==========================================

          if (response.data?.orderId) {
            sessionStorage.setItem(
              "currentOrderId",
              JSON.stringify(
                response.data.orderId
              )
            );
          }

          // ==========================================
          // SUCCESS
          // ==========================================

          toast({
            title:
              "Payment Successful 🎉",

            description:
              "Your PayPal payment was completed successfully.",
          });

          console.log(
            "PayPal payment completed successfully."
          );

          // ==========================================
          // CALLBACK TO CHECKOUT
          // ==========================================

          if (onSuccess) {
            onSuccess(response.data);
          }
        } catch (error) {
          console.error(
            "PayPal capture error:",
            error
          );

          toast({
            title:
              "Payment Capture Failed",

            description:
              error?.response?.data?.message ||
              error?.message ||
              "Unable to complete PayPal payment.",

            variant: "destructive",
          });
        }
      },

      // ==========================================
      // CANCEL
      // ==========================================

      onCancel: (data) => {
        console.log(
          "PayPal payment cancelled:",
          data
        );

        toast({
          title:
            "Payment Cancelled",

          description:
            "You cancelled the PayPal payment.",
        });
      },

      // ==========================================
      // PAYPAL ERROR
      // ==========================================

      onError: (error) => {
        console.error(
          "PayPal button error:",
          error
        );

        toast({
          title:
            "PayPal Error",

          description:
            "Something went wrong with PayPal. Please try again.",

          variant: "destructive",
        });
      },

      // ==========================================
      // OPTIONAL CLICK
      // ==========================================

      onClick: () => {
        console.log(
          "PayPal button clicked."
        );
      },
    });

    buttonsRef.current = buttons;

    // ==========================================
    // CHECK ELIGIBILITY
    // ==========================================

    if (!buttons.isEligible()) {
      console.error(
        "PayPal buttons are not eligible."
      );

      toast({
        title:
          "PayPal Unavailable",

        description:
          "PayPal is currently unavailable for this browser/account.",

        variant: "destructive",
      });

      return;
    }

    // ==========================================
    // RENDER
    // ==========================================

    buttons
      .render(container)
      .then(() => {
        console.log(
          "PayPal buttons rendered successfully"
        );
      })
      .catch((error) => {
        console.error(
          "PayPal render error:",
          error
        );
      });

    // ==========================================
    // CLEANUP
    // ==========================================

    return () => {
      if (buttonsRef.current === buttons) {
        buttonsRef.current = null;
      }

      try {
        buttons.close();
      } catch (error) {
        console.log(
          "PayPal cleanup:",
          error
        );
      }
    };
  }, [sdkLoaded]);

  // ==========================================
  // CLIENT ID MISSING
  // ==========================================

  if (!PAYPAL_CLIENT_ID) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        PayPal Client ID is missing.
      </div>
    );
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="rounded-md border p-4 text-center text-sm">
        Loading PayPal...
      </div>
    );
  }

  // ==========================================
  // PAYPAL BUTTON CONTAINER
  // ==========================================

  return (
    <div className="w-full">
      <div
        ref={paypalRef}
        className="w-full min-h-[45px]"
      />
    </div>
  );
}

export default PayPalButton;