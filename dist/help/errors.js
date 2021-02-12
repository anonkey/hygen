"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNoGeneratorsFoundMessage = void 0;
exports.getNoGeneratorsFoundMessage = () => `No generators or actions found. 

      This means I didn't find a _templates folder right here, 
      or anywhere up the folder tree starting here.

      Here's how to start using Hygen:

      $ hygen init self
      $ hygen with-prompt new --name my-generator

      (edit your generator in _templates/my-generator)

      $ hygen my-generator 

      See http://hygen.io for more.
      
      `;
//# sourceMappingURL=errors.js.map