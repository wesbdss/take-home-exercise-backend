import { models } from "./db/db";
import {gql} from "apollo-server-express";

export const typeDefs = gql`
# Estrutura dos dados
  type Ticket {
    id: ID!
    title: String!
    isCompleted: Boolean!
    children: [Ticket]!
  }

  type Query {
    # Retorna lista de tickts raiz
    tickets: [Ticket]!

    # Retorna o tickt com base no id
    ticket(id: ID!): Ticket!
  }

  type Mutation {
    # Cria um Ticket com os parametros enviados
    createTicket(title: String!, isCompleted: Boolean): Ticket!

    # Atualiza o título com base no id
    updateTicket(id: ID!, title: String!): Ticket!

    # atualiza o campo "isCompleted" do ticket com base no id
    toggleTicket(id: ID!, isCompleted: Boolean!): Ticket!

    # apaga o ticket
    removeTicket(id: ID!): Boolean!

    # Todos os ids das childrens são adicionado so parentId, depois retorna o ticket
    addChildrenToTicket(parentId: ID!, childrenIds: [ID!]!): Ticket!

    # Atualiza o parentId com base no childId
    setParentOfTicket(parentId: ID!, childId: ID!): Ticket!

    # O ticket recebe o nível root (sem parentId)
    removeParentFromTicket(id: ID!): Ticket!
  }
`;


export const resolvers = {
  Query: {
    /*
     * Primeira Query Previamente implementada
     */
    tickets: async () => {
      return models.Ticket.findAll({
        where: {
          parentId: null,
        }
      });
    },
    /*
     * Query com base no id 
     */
    ticket: async (source,args) => {
      return models.Ticket.findByPk(args.id)
    }
  },
    /*
     * Implementação do método children utilizado na estruttura de dados para exibição dos filhos
     */
  Ticket: {
    children : async (source) => {
      return models.Ticket.findAll({
        where: {
          parentId : source.id,
        }
      })
    }
  },
    /*
     * Mutations
     */
  Mutation: {
    /*
     * Cria um novo ticket e retorna o ticket criado
     */
    createTicket: async (source,args)=>{
      try {
        const aux = await models.Ticket.create({title: args.title,isCompleted: args.isCompleted})
        await aux.save();
      return aux
      } catch (error) {
        //caso dê erro não retorna nada
        return 
      }
    },
    updateTicket:async (source,args)=>{
      /*
       * Atualiza o ticket buscando pelo Id
       */
      try {
        const aux = await models.Ticket.findByPk(args.id);
        aux.update({title: args.title})
        aux.save();
        return aux
      } catch (error) {
        //caso dê erro não retorna nada
        return 
      }
    },
    toggleTicket:async (source,args)=>{
      /*
       * Troca o campo "isCompleted" e retorna o ticket
       */
      try {
        const aux = await models.Ticket.findByPk(args.id);
        aux.update({isCompleted: args.isCompleted})
        aux.save();
        return aux
      } catch (error) {
        //caso dê erro não retorna nada
        return 
      }
    },
    removeTicket:async (source,args)=>{
      /*
       * Exclui o tickt com base no id e retorna true
       */
      try {
        const aux = await models.Ticket.findByPk(args.id);
        aux.destroy()
        return true
      } catch (error) {
        //caso dê erro retorna false
        return false
      }
    },
    addChildrenToTicket: (source,args)=>{
      /*
       * Adiciona um ticket filho ao parentId com base no id e retorna o ticket pai
       */
      try {
          args.childrenIds.map(async (id) => {
          const aux = await models.Ticket.findByPk(id)
          aux.update({parentId:args.parentId})
          aux.save();
          return aux
        })
        return models.Ticket.findByPk(args.parentId)
      } catch (error) {
        //caso dê erro não retorna nada
        return 
      }
      
    },
    setParentOfTicket:async (source,args)=>{
      /*
       * seta ou troca o parentId do ticket criança e retorna o tickt 
       */
      try{
        const aux = await models.Ticket.findByPk(args.childId)
        aux.update({parentId:args.parentId})
        aux.save();
        return aux
      }catch (error){
        //caso dê erro não retorna nada
        return 
      }
    },
    removeParentFromTicket:async (source,args)=>{
      /*
       * Remove o parentId do ticket , trocando para null e retorna o ticket
       */
      try {
        const aux = await models.Ticket.findByPk(args.id)
        aux.update({parentId:null})
        aux.save();
        return aux
      } catch (error) {
        //caso dê erro não retorna nada
        return 
      }
    },
  }
};