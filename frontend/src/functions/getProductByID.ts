import axios from "axios";

 

import {useState, useCallback} from "react"

export interface Product
{
_id: string;
name: string;
price: number;
description: string;
imageUrl: string;
unitssold:number;
category: string;
stock: number;
sellername:string,
createdAt: Date;
updatedAt: Date;
reviews: [];
}

export interface Review{
_id:string,
username: string,
thumbnailUrl: string,
rating: number,
comment: string,
createdAt: Date,
updatedAt: Date
}

export function useProductData (productid:string) {
const API_URL = "http://localhost:3000";
    const [product, setProduct] = useState({
_id:"",
name: "",
price: 0,
description: "",
imageUrl: "" ,
category: "",
stock: 0,
unitssold:0,
sellername:"",
createdAt: new Date(),
updatedAt: new Date(),
reviews:[]
 
})

const [loading, setLoading] = useState(true)

let currentProduct:any = null;

const fetchProductById = useCallback(async () => {
try{
const response = await axios.get (`${API_URL}/api/products/${productid}`)
 
const prod  = response.data?.data||response.data;

 
currentProduct = prod

if (currentProduct){
setProduct({
_id:currentProduct._id,
name:currentProduct.name,
price: currentProduct.price,
description:currentProduct.description,
imageUrl: currentProduct.imageUrl,
unitssold: currentProduct.unitssold,
category: currentProduct.category,
stock:currentProduct.stock,
sellername:currentProduct.sellername,
createdAt: currentProduct.createdAt,
updatedAt: currentProduct.updatedAt,
reviews: currentProduct.reviews
 
})
console.log("product successfully set, Huzzah!: ", product)

}
else(console.warn("Sorry, buddy, but we couldn't find that product"))
}
catch{
console.warn("Could not find matching product")


}
finally{setLoading(false)}

},[productid])

 
return{
currentProduct:product,
setCurrentProduct:setProduct,
loading,
fetchProductById
}
}

