import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PayosWebhookBodyPayload } from '../dto/payos-webhook-body.payload';
import { createHmac } from 'node:crypto';
import { convertObjToQueryStr, sortObjDataByKey } from '../payos-utils';

@Injectable()
export class PaymentWebhookGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) { }

  isValidData(
    data: Record<string, unknown>,
    currentSignature: string,
    checksumKey: string,
  ) {
    const sortedDataByKey = sortObjDataByKey(data);
    const dataQueryStr = convertObjToQueryStr(sortedDataByKey);
    const dataToSignature = createHmac('sha256', checksumKey)
      .update(dataQueryStr)
      .digest('hex');
    return dataToSignature == currentSignature;
  }

  canActivate(context: ExecutionContext): boolean {
    try {
      const req = context.switchToHttp().getRequest<Request>();
      const CHECKSUM_KEY =
        this.configService.getOrThrow<string>('PAYOS_CHECKSUM_KEY');

      const body = req.body as unknown as PayosWebhookBodyPayload;

      const isValidPayload = this.isValidData(
        body.data as unknown as Record<string, unknown>,
        body.signature,
        CHECKSUM_KEY,
      );
      console.log({ CHECKSUM_KEY, isValidPayload, body });
      if (!isValidPayload) {
        throw new UnauthorizedException('Invalid payload');
      }

      return true;
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Invalid payload');
    }
  }
}