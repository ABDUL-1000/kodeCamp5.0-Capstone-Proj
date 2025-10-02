import Joi from 'joi';

export const validateRegistration = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().min(10).required(),
    role: Joi.string().valid('customer', 'rider').required(),
    address: Joi.when('role', {
      is: 'customer',
      then: Joi.string().required(),
      otherwise: Joi.string().optional()
    }),
    vehicleType: Joi.when('role', {
      is: 'rider',
      then: Joi.string().required(),
      otherwise: Joi.string().optional()
    }),
    licensePlate: Joi.when('role', {
      is: 'rider',
      then: Joi.string().required(),
      otherwise: Joi.string().optional()
    })
  });
  
  return schema.validate(data);
};

export const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });
  
  return schema.validate(data);
};

export const validateDelivery = (data) => {
  const schema = Joi.object({
    pickupAddress: Joi.string().required(),
    deliveryAddress: Joi.string().required(),
    packageDescription: Joi.string().required(),
    packageWeight: Joi.number().positive().required(),
    packageDimensions: Joi.object({
      length: Joi.number().positive(),
      width: Joi.number().positive(),
      height: Joi.number().positive()
    }).optional(),
    estimatedCost: Joi.number().positive().required()
  });
  
  return schema.validate(data);
};

export const validatePayment = (data) => {
  const schema = Joi.object({
    deliveryId: Joi.string().required(),
    amount: Joi.number().positive().required(),
    paymentMethod: Joi.string().valid('card', 'bank_transfer').default('card')
  });
  
  return schema.validate(data);
};

export const validateTracking = (data) => {
  const schema = Joi.object({
    deliveryId: Joi.string().required(),
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    status: Joi.string().valid('pending', 'accepted', 'in-progress', 'completed', 'cancelled').required(),
    note: Joi.string().optional()
  });
  
  return schema.validate(data);
};