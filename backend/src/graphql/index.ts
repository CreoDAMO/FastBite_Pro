
import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String!
    role: String!
    walletAddress: String
    complianceStatus: String!
    fbtBalance: Float!
    stakedAmount: Float!
    createdAt: String!
    updatedAt: String!
  }

  type Restaurant {
    id: ID!
    name: String!
    cuisine: String!
    rating: Float!
    deliveryTime: String!
    deliveryFee: Float!
    image: String!
    verified: Boolean!
    ethicalScore: Int!
    categories: [String!]!
    licenseVerified: Boolean!
    healthRating: Float!
  }

  type Order {
    id: ID!
    customerId: String!
    restaurantId: String!
    status: String!
    total: Float!
    items: [String!]!
    createdAt: String!
  }

  type Query {
    me: User
    restaurants: [Restaurant!]!
    orders: [Order!]!
  }

  type Mutation {
    createOrder(restaurantId: String!, items: [String!]!, total: Float!): Order!
  }
`;

export const resolvers = {
  Query: {
    me: async (parent: any, args: any, context: any) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      
      const { User } = await import('../models/User');
      return await User.findById(context.user.userId);
    },
    
    restaurants: async () => {
      // Return mock data for now
      return [
        {
          id: "1",
          name: "Artisan Pizza Co.",
          cuisine: "Italian",
          rating: 4.8,
          deliveryTime: "15-25 min",
          deliveryFee: 0,
          image: "🍕",
          verified: true,
          ethicalScore: 95,
          categories: ["Pizza", "Italian"],
          licenseVerified: true,
          healthRating: 4.7
        }
      ];
    },
    
    orders: async (parent: any, args: any, context: any) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      
      // Return mock data for now
      return [];
    }
  },
  
  Mutation: {
    createOrder: async (parent: any, args: any, context: any) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      
      // Mock order creation
      return {
        id: `order_${Date.now()}`,
        customerId: context.user.userId,
        restaurantId: args.restaurantId,
        status: 'pending',
        total: args.total,
        items: args.items,
        createdAt: new Date().toISOString()
      };
    }
  }
};
