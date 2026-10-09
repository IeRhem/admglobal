import {
    create_contact_contract,
    delete_contact_contract,
    list_contacts_contract,
    update_contact_contract,
} from "./contact.contract";
import {
    get_event_contract,
    create_event_contract,
    list_events_contract,
    update_event_contract,
    delete_flyer_contract,
    delete_event_contract,
    update_reservation_contract,
    create_reservation_contract,
    update_minister_contract,
    add_minister_contract,
    update_flyer_contract,
    add_flyer_contract,
} from "./events.contract";
import {
    add_testimonial_image_contract,
    create_testimonial_contract,
    delete_testimonial_contract,
    delete_testimonial_image_contract,
    get_testimonial_contract,
    list_testimonies_contract,
    update_testimonial_contract,
} from "./testimonial.contract";

export const contract = {
    testimonial: {
        create: create_testimonial_contract,
        add_image: add_testimonial_image_contract,
        update: update_testimonial_contract,
        delete: delete_testimonial_contract,
        delete_image: delete_testimonial_image_contract,
        get: get_testimonial_contract,
        list: list_testimonies_contract
    },
    event: {
        create: create_event_contract,
        list: list_events_contract,
        update: update_event_contract,
        add_flyer: add_flyer_contract,
        update_flyer: update_flyer_contract,
        add_minister: add_minister_contract,
        update_minister: update_minister_contract,
        create_reservation: create_reservation_contract,
        update_reservation: update_reservation_contract,
        delete: delete_event_contract,
        delete_flyer: delete_flyer_contract,
        get: get_event_contract
    },
    contact: {
        create: create_contact_contract,
        update: update_contact_contract,
        delete: delete_contact_contract,
        list: list_contacts_contract
    }
}