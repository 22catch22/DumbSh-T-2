 import axios from "axios"

export async function getAllSellers()

{
const API_URL = "http://localhost:3000"
try
{
const response = await axios.get(`${API_URL}/api/sellers`);    
console.log(response.data)
return response.data
}
catch(error)
{
console.error("Failed to fetch all sellers, idiot", error);
return [];

}

}