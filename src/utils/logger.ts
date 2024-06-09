import winston, {createLogger, transports, format} from 'winston'

const logger = createLogger({
    transports: [
      new transports.File({
        filename: 'error.log',
        level: 'error',
        format: format.combine(
            format.timestamp({
              format: 'YYYY-MM-DD HH:mm:ss',
            }),
            format.json()
          ),
      }),
      new transports.File({
        filename: 'info.log',
        level: 'info',
        format: format.combine(
            format.timestamp({
              format: 'YYYY-MM-DD HH:mm:ss',
            }),
            format.json()
          ),
      }),
      new transports.Console({
        level: 'info',
        format: winston.format.json(),
      }),
    ],
  });
export default logger

