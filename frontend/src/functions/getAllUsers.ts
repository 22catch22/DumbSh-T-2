 import axios from "axios"

export async function getAllUsers()

{
const API_URL = "http://localhost:3000"
try
{
const response = await axios.get(`${API_URL}/api/users`);    
console.log(response.data)
return response.data
}
catch(error)
{
console.error("Failed to fetch all users, idiot", error);
return [];

}

}