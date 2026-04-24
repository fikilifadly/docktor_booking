import { CONFIRMATION_TYPE } from './AppointmentsPage.config';
import type { ConfirmationTitleMessage } from './AppointmentPage.types';

const getConfirmationTitleMessage = (type: string, prevState: string = '', newState: string = ''): ConfirmationTitleMessage => {
  const result = {
    title: '',
    message: '',
  }
  
  switch (type) {
    case CONFIRMATION_TYPE.LOGOUT.type:
      result.title = 'Logout';
      result.message = 'Are you sure you want to log out?';
      break;
    case CONFIRMATION_TYPE.CANCEL.type:
      result.title = 'Cancel Appointment';
      result.message = `Are you sure you want to cancel this appointment from ${prevState}?`;
      break;
    case CONFIRMATION_TYPE.CHANGE_DOCTOR.type:
      result.title = 'Change Doctor';
      result.message = `Are you sure you want to change the doctor for this appointment from ${prevState} to ${newState}?`;
      break;
    case CONFIRMATION_TYPE.RESCHEDULE.type:
      result.title = 'Reschedule Appointment';
      result.message = `Are you sure you want to reschedule this appointment from ${prevState} to ${newState}?`;
      break;
    default:
      console.log('no confirmation type matched');
      break;
  }

  return result;
}

export { getConfirmationTitleMessage };