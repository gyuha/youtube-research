import { registerChannel } from '@/app/actions/register-channel';

export function ChannelRegistrationForm() {
  async function registerChannelAction(formData: FormData) {
    'use server';

    await registerChannel({
      channelUrl: String(formData.get('channelUrl') ?? ''),
    });
  }

  return (
    <form action={registerChannelAction} className="space-y-3">
      <label className="block text-sm font-medium text-slate-700" htmlFor="channel-url">
        YouTube channel URL
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          className="min-w-0 flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-500"
          id="channel-url"
          name="channelUrl"
          placeholder="https://www.youtube.com/@openai"
          required
          type="url"
        />
        <button
          className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          type="submit"
        >
          Register Channel
        </button>
      </div>
    </form>
  );
}
