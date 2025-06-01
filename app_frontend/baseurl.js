export const getUserUrl = () => {
    return process.env.NEXT_PUBLIC_USER_API_URL || 'https://cn334final.onrender.com';
};
export const getProductUrl = () => {
    return process.env.NEXT_PUBLIC_PRODUCT_API_URL || 'https://cn334final-product.onrender.com';
};
