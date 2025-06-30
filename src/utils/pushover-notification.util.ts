// @ts-expect-error @ts-ignore
import Push from "pushover-notifications";
import { PUSHOVER_TOKEN, PUSHOVER_USER } from "@/config/env";
import moment from "moment";

export default class PushoverNotificationUtil {
    #pushover: Push;

    constructor() {
        this.#pushover = new Push({
            user: PUSHOVER_USER,
            token: PUSHOVER_TOKEN,
            // httpOptions: {
            //     proxy: HTTP_PROXY,
            // },
            // onerror: function(error) {},
            // update_sounds: true // update the list of sounds every day - will
            // prevent app from exiting.
        });
    }

    visitor(ip: string, agent: string) {
        const msg = {
            message: `New visitor ${ip}\n\nDevice: ${agent} \n\nDate: ${moment().format("MMMM Do YYYY, h:mm:ss a")}`,
            title: "Portfolio visitor",
            sound: "magic",
            device: agent,
            priority: 0,
        };

        this.#pushover.send(msg, (err: unknown, result: unknown) => {
            if (err) {
                throw err;
            }
            console.log(result);
        });
    }

    unknownInquiry(question: string) {
        const msg = {
            message: `Chatbot unanswered question '${question}'`,
            title: "Chatbot Response",
            sound: "magic",
            priority: 0,
        };

        this.#pushover.send(msg, (err: unknown, result: unknown) => {
            if (err) {
                throw err;
            }
            console.log(result);
        });
    }
}
