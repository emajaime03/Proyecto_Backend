import {CartsDAO} from "../dao/factory.js"

class CartsService{
    constructor(dao){
        this.CartsDAO= new dao()
    }

    async getAllCarts(){
        return this.CartsDAO.getAll()
    }
        
    async getCartById(id){
        return await this.CartsDAO.getOneByPopulate({_id:id})
    }

    async createCart(){
        return await this.CartsDAO.create()
    }

    async update(id, cart) {
        return await this.CartsDAO.update(id, cart); 
    }

    async deleteAllProducts(id) {
        return await this.CartsDAO.delete(id);
    }
}

export const cartsService=new CartsService(CartsDAO)