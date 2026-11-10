export interface IPurchase{
    productId: string,
    productname: string,
    thumbnailUrl: string,
    sellerName: string,
    price: number,
    quantity: number,
    purchaseAt: Date,
    updatedAt: Date,
    createdAt: Date
}