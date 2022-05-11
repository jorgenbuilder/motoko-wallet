import React from 'react'
import { toast, ToastContainer } from 'react-toastify';
import useMessageStore, { Message } from 'stores/messages';
import useThemeStore from 'stores/theme';
import Styles from './styles.module.css'

interface Props {
    children?: React.ReactNode;
}

export default function Messages (props : Props) {
    const { messages, readMessage } = useMessageStore();
    const { theme } = useThemeStore();

    React.useEffect(() => {
        const unread = Object.entries(messages).filter(([i, message]) => !message.read);
        unread.forEach(([i, message]) => {
            readMessage(parseInt(i));
            toast(message.message);
        });
    }, [messages]);

    return <ToastContainer
        theme={theme}
        position='bottom-center'
    />
}