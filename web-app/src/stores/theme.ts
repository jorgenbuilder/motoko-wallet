import create from 'zustand'

type ColorScheme = 'dark' | 'light';

interface ThemeStore {
    theme: ColorScheme;
    setTheme: (t : ColorScheme) => void;
};

const useThemeStore = create<ThemeStore>((set, get) => ({
    theme: getUserColorScheme(),

    setTheme (theme) {
        set({ theme });
        window.localStorage.setItem('prefers-color-scheme', theme);
        document.querySelector('html')?.setAttribute('data-theme', theme);
    },
}));

export default useThemeStore;

function getUserColorScheme () : ColorScheme {
    let scheme : ColorScheme = 'dark';

    const savedValue = window.localStorage.getItem('prefers-color-scheme');
    const sysPreferDark : boolean = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const sysPreferLight : boolean = window.matchMedia('(prefers-color-scheme: light)').matches;

    if (savedValue === 'dark') {
        scheme = 'dark';
    } else if (savedValue === 'light') {
        scheme = 'light';
    } else if (sysPreferDark) {
        scheme = 'dark';
    } else if (sysPreferLight) {
        scheme = 'light';
    }

    document.querySelector('html')?.setAttribute('data-theme', scheme);

    return scheme;
};