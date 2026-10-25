import Link from "next/link";
import Footer from "../components/Footer";

export default function CheckoutPage() {
  return (
    <>
      <main className="cart-page">
        <div className="checkout-placeholder">
          <p className="cart-eyebrow">SocMark Marketplace</p>
          <h1>Checkout</h1>
          <p>
            Checkout is a frontend preview. Payment and order placement are not connected yet.
            Your cart is saved in this browser.
          </p>
          <Link href="/cart" className="btn-checkout-primary">
            Return to Shopping Cart
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
