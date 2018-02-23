/**
 * @license Use of this source code is governed by a GPL-3.0 license that
 * can be found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

import { firebase } from "../firebase";
import { error_, unsupported_ } from "../mock-error";

export interface MockMessagingOptions {
    app: firebase.app.App;
}

export class MockMessaging implements firebase.messaging.Messaging {

    private app_: firebase.app.App;

    constructor(options: MockMessagingOptions) {

        this.app_ = options.app;
    }

    get app(): firebase.app.App {

        return this.app_;
    }

    deleteToken(token: string): Promise<any> | null {

        throw unsupported_();
    }

    getToken(): Promise<any> | null {

        throw unsupported_();
    }

    onMessage(nextOrObserver: Object): () => any {

        throw unsupported_();
    }

    onTokenRefresh(nextOrObserver: Object): () => any {

        throw unsupported_();
    }

    requestPermission(): Promise<any> | null {

        throw unsupported_();
    }

    sendToDevice(
        registrationToken: string | string[],
        payload: firebase.messaging.MessagingPayload,
        options?: firebase.messaging.MessagingOptions
    ): Promise<firebase.messaging.MessagingDevicesResponse> {

        throw unsupported_();
    }

    sendToDeviceGroup(
        notificationKey: string,
        payload: firebase.messaging.MessagingPayload,
        options?: firebase.messaging.MessagingOptions
    ): Promise<firebase.messaging.MessagingDeviceGroupResponse> {

        throw unsupported_();
    }

    sendToTopic(
        topic: string,
        payload: firebase.messaging.MessagingPayload,
        options?: firebase.messaging.MessagingOptions
    ): Promise<firebase.messaging.MessagingTopicResponse> {

        throw unsupported_();
    }

    sendToCondition(
        condition: string,
        payload: firebase.messaging.MessagingPayload,
        options?: firebase.messaging.MessagingOptions
    ): Promise<firebase.messaging.MessagingConditionResponse> {

        throw unsupported_();
    }

    setBackgroundMessageHandler(callback: (a: Object) => any): any {

        throw unsupported_();
    }

    subscribeToTopic(
        registrationToken: string,
        topic: string
    ): Promise<firebase.messaging.MessagingTopicManagementResponse>;
    subscribeToTopic(
        registrationTokens: string[],
        topic: string
    ): Promise<firebase.messaging.MessagingTopicManagementResponse>;
    subscribeToTopic(
        registrationTokens: string | string[],
        topic: string
    ): Promise<firebase.messaging.MessagingTopicManagementResponse> {

        throw unsupported_();
    }

    unsubscribeFromTopic(
        registrationToken: string,
        topic: string
    ): Promise<firebase.messaging.MessagingTopicManagementResponse>;
    unsubscribeFromTopic(
        registrationTokens: string[],
        topic: string
    ): Promise<firebase.messaging.MessagingTopicManagementResponse>;
    unsubscribeFromTopic(
        registrationTokens: string | string[],
        topic: string
    ): Promise<firebase.messaging.MessagingTopicManagementResponse> {

        throw unsupported_();
    }

    useServiceWorker(registration: any): any {

        throw unsupported_();
    }
}
