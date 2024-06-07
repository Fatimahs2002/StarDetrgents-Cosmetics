import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const sessionCart = sessionStorage.getItem("cart");
    return sessionCart ? JSON.parse(sessionCart) : [];
  });

  const [cartID, setCartID] = useState(() => {
    const sessionCartID = sessionStorage.getItem("cartID");
    return sessionCartID ? JSON.parse(sessionCartID) : null;
  });

  useEffect(() => {
    sessionStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (cartID !== null) {
      sessionStorage.setItem("cartID", JSON.stringify(cartID));
    }
  }, [cartID]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const updatedCart = [...prevCart, product];
      return updatedCart;
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.filter((item) => item._id !== productId);
      return updatedCart;
    });
  };

  const updateQuantity = (product, newQuantity, selectedOptions) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product._id === product._id &&
        item.selectedOptions.color === selectedOptions.color &&
        JSON.stringify(item.selectedOptions.weights) ===
          JSON.stringify(selectedOptions.weights)
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const submitCart = async (userId) => {
    try {
      const orderData = {
        user: userId,
        cartId: cartID,
        products: cart.map((item) => ({
          productId: item._id.toString(),
          quantity: item.quantity,
          selectedOptions: item.selectedOptions,
        })),
        orderStatus: "Pending",
        orderDate: new Date(),
      };
      // console.log("Submitting order:", orderData);
      const response = await axios.post(
        `${process.env.REACT_APP_URL}/order/create`,
        orderData
      );
      if (response && response.status === 200 && response.data.success) {
        // console.log("Order submitted successfully:", response.data);
        setCart([]);
        sessionStorage.removeItem("cart");
        return response.data;
      } else {
        // console.error("Unexpected response:", response);
        throw new Error("Unexpected response from server");
      }
    } catch (error) {
      console.error("Error submitting cart:", error);
      throw error;
    }
  };

  // console.log("Current cart:", cart);
  // console.log("Current cartID:", cartID);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        submitCart,
        cartID,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
