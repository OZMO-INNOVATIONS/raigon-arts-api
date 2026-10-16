import { Router } from 'express';
import { FrameSizeController } from './frameSize.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { optionalToken } from '../../middleware/auth.middleware.js';
import {
  createFrameSizeSchema,
  updateFrameSizeSchema,
} from './frameSize.schemas.js';

const router = Router();

router.use(optionalToken);

// 4.1 List Frame Sizes
router.get('/', FrameSizeController.list);

// 4.2 Add Frame Size
router.post('/', validate({ body: createFrameSizeSchema }), FrameSizeController.create);

// 4.3 Update Frame Size
router.put('/:code', validate({ body: updateFrameSizeSchema }), FrameSizeController.update);

// 4.4 Delete Frame Size
router.delete('/:code', FrameSizeController.delete);

export default router;
