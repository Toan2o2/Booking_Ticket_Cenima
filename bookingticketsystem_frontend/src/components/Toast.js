import React from 'react';
import { message } from 'antd';

class Toast {
  static success(content) {
    message.success(content);
  }

  static error(content) {
    message.error(content);
  }

  static warning(content) {
    message.warning(content);
  }

  static info(content) {
    message.info(content);
  }
}

export default Toast; 