import type { Media } from "../../../common/interface/mediaInterface";

export interface IPaymentChild {
    id: string;
    paymentId: string;
    label: string;
    method: string;
    isActive: boolean;
    sortOrder: number;
    createAt: Date | string;
    updateAt: Date | string;
}

export interface IPayment {
    id: string;
    label: string;
    icon?: Media | null;
    method: string;
    isActive: boolean;
    sortOrder: number;
    paymentChilds: IPaymentChild[];
    createAt: Date | string;
    updateAt: Date | string;
}
