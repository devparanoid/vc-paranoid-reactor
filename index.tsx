
import { NavContextMenuPatchCallback } from "@api/ContextMenu";
import { definePluginSettings } from "@api/Settings";
import definePlugin, { OptionType } from "@utils/types";
import {
    Menu,
    Toasts,
    UserStore,
    RestAPI
} from "@webpack/common";

// Local interface
interface MessageCreateEvent {
    channelId: string;
    message: {
        id: string;
        author: {
            id: string;
            username: string;
            global_name?: string;
        };
        content: string;
    };
    guildId?: string;
}

export const settings = definePluginSettings({
    emojis: {
        type: OptionType.STRING,
        description: "Tepki emojileri. Rastgele mod için virgül kullan, sıralı mod için yan yana yaz (örn: '🤡❤️🔥' sıralı, '🤡,❤️,🔥' rastgele)",
        default: "🤡",
        restartNeeded: false,
    },
    targetUserIds: {
        type: OptionType.STRING,
        description: "Hedef Kullanıcı IDleri (Menüden yönetilir)",
        default: "",
        hidden: true,
        restartNeeded: false,
    },
    mode: {
        type: OptionType.SELECT,
        description: "Tepki Modu",
        default: "sequential",
        options: [
            { label: "Sıralı (TÜM emojileri sırayla ekle)", value: "sequential" },
            { label: "Rastgele (Rastgele BİR emoji seç)", value: "random" },
            { label: "Tekli (Sadece ilk emojiyi kullan)", value: "single" }
        ],
        restartNeeded: false,
    },
    delay: {
        type: OptionType.NUMBER,
        description: "İlk tepkiden önce bekleme süresi (ms)",
        default: 300,
        restartNeeded: false,
    },
    reactionDelay: {
        type: OptionType.NUMBER,
        description: "Her tepki arasındaki bekleme süresi (sıralı mod için, ms)",
        default: 150,
        restartNeeded: false,
    }
});

// --- Logic ---

function getTargetList(): string[] {
    return settings.store.targetUserIds.split(",").filter((id) => id.trim().length > 0);
}

function addToTargets(userId: string) {
    const list = getTargetList();
    if (!list.includes(userId)) {
        list.push(userId);
        settings.store.targetUserIds = list.join(",");
        Toasts.show({
            message: `${UserStore.getUser(userId)?.username || userId} otomatik tepki listesine eklendi`,
            type: Toasts.Type.SUCCESS
        });
    }
}

function removeFromTargets(userId: string) {
    const list = getTargetList();
    const index = list.indexOf(userId);
    if (index !== -1) {
        list.splice(index, 1);
        settings.store.targetUserIds = list.join(",");
        Toasts.show({
            message: `${UserStore.getUser(userId)?.username || userId} otomatik tepki listesinden çıkarıldı`,
            type: Toasts.Type.SUCCESS
        });
    }
}

function isTarget(userId: string): boolean {
    return getTargetList().includes(userId);
}

function parseEmoji(emojiStr: string): string {
    const trimmed = emojiStr.trim();
    const customMatch = trimmed.match(/<a?:(\w+):(\d+)>/);
    if (customMatch) {
        return `${customMatch[1]}:${customMatch[2]}`;
    }
    return encodeURIComponent(trimmed);
}

function getEmojiList(): string[] {
    const raw = settings.store.emojis;

    if (raw.includes(",")) {
        return raw.split(",").map(e => e.trim()).filter(e => e.length > 0);
    }

    const emojiRegex = /(<a?:\w+:\d+>|[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{231A}-\u{231B}]|[\u{23E9}-\u{23F3}]|[\u{23F8}-\u{23FA}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2614}-\u{2615}]|[\u{2648}-\u{2653}]|[\u{267F}]|[\u{2693}]|[\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}]|[\u{26FA}]|[\u{26FD}]|[\u{2702}]|[\u{2705}]|[\u{2708}-\u{270D}]|[\u{270F}]|[\u{2712}]|[\u{2714}]|[\u{2716}]|[\u{271D}]|[\u{2721}]|[\u{2728}]|[\u{2733}-\u{2734}]|[\u{2744}]|[\u{2747}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2763}-\u{2764}]|[\u{2795}-\u{2797}]|[\u{27A1}]|[\u{27B0}]|[\u{27BF}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{2B50}]|[\u{2B55}]|[\u{3030}]|[\u{303D}]|[\u{3297}]|[\u{3299}])/gu;

    const matches = raw.match(emojiRegex);
    return matches || [raw];
}

async function triggerReaction(channelId: string, messageId: string) {
    const allEmojis = getEmojiList();
    if (allEmojis.length === 0) return;

    if (settings.store.delay > 0) {
        await new Promise(r => setTimeout(r, settings.store.delay));
    }

    let emojisToUse: string[];

    switch (settings.store.mode) {
        case "random":
            emojisToUse = [allEmojis[Math.floor(Math.random() * allEmojis.length)]];
            break;
        case "single":
            emojisToUse = [allEmojis[0]];
            break;
        case "sequential":
        default:
            emojisToUse = allEmojis;
            break;
    }

    for (const rawEmoji of emojisToUse) {
        const emoji = parseEmoji(rawEmoji);
        try {
            await RestAPI.put({
                url: `/channels/${channelId}/messages/${messageId}/reactions/${emoji}/@me`,
            });
            if (emojisToUse.length > 1) {
                await new Promise(r => setTimeout(r, settings.store.reactionDelay));
            }
        } catch (e) {
            console.error("[OtomatikTepki] Tepki eklenemedi:", e);
        }
    }
}


// --- Menu ---

interface UserContextProps {
    user: { id: string };
}

const UserContextPatch: NavContextMenuPatchCallback = (children, { user }: UserContextProps) => {
    if (!user || user.id === UserStore.getCurrentUser().id) return;

    const target = isTarget(user.id);

    const label = target ? "Otomatik Tepkiyi Durdur" : "Otomatik Tepki Başlat";
    const color = target ? "danger" : "default";

    children.splice(-1, 0, (
        <Menu.MenuGroup>
            <Menu.MenuItem
                id="auto-reactor-toggle"
                label={label}
                color={color}
                action={() => target ? removeFromTargets(user.id) : addToTargets(user.id)}
            />
        </Menu.MenuGroup>
    ));
};

export default definePlugin({
    name: "ParanoidReactor",
    description: "Belirli kullanıcıların mesajlarına otomatik olarak emoji ile tepki verir. | Developed by paranoid",
    authors: [{ id: 123456789n, name: "paranoid" }],
    settings,
    contextMenus: {
        "user-context": UserContextPatch
    },
    flux: {
        MESSAGE_CREATE(action: MessageCreateEvent) {
            if (!action.message || !action.message.author) return;
            const authorId = action.message.author.id;

            if (authorId === UserStore.getCurrentUser().id) return;

            if (isTarget(authorId)) {
                const channelId = action.channelId;
                const messageId = action.message.id;
                triggerReaction(channelId, messageId);
            }
        }
    }
});
