import type { AudioPlayerProps } from './AudioPlayer.types';
import html from '@/lib/render';
import type SButton from '../SButton/SButton';

export default class AudioPlayer extends HTMLElement {
	static props = {
		audioUrl: { type: 'string', required: true },
		onEnded: { type: 'function', default: null },
		compact: { type: 'boolean', default: false },
	};
	props: AudioPlayerProps;

	private $audio: HTMLAudioElement | null = null;
	private $playPauseBtn: SButton | null = null;
	private $restartBtn: HTMLElement | null = null;
	private $progress: HTMLElement | null = null;
	private $progressBar: HTMLElement | null = null;
	private $currentTime: HTMLElement | null = null;
	private $duration: HTMLElement | null = null;
	private playIcon: HTMLElement | null = null;
	private pauseIcon: HTMLElement | null = null;

	constructor(props: AudioPlayerProps) {
		super();
		// @ts-ignore slice is provided by the framework at runtime
		slice.attachTemplate(this);
		// @ts-ignore controller at runtime
		slice.controller.setComponentProps(this, props);
		this.props = props;
	}

	async init() {
		const fragment = await this.getTemplate();
		this.appendChild(fragment);

		this.$audio = this.querySelector('.ap-audio') as HTMLAudioElement | null;
		this.$progress = this.querySelector('.ap-progress');
		this.$progressBar = this.querySelector('.ap-progress-bar');
		this.$currentTime = this.querySelector('.ap-current-time');
		this.$duration = this.querySelector('.ap-duration');

		if (this.$audio) {
			// Wire audio events
			this.$audio.addEventListener('loadedmetadata', () => {
				this.updateDuration();
			});

			this.$audio.addEventListener('timeupdate', () => {
				this.updateProgress();
			});

			this.$audio.addEventListener('ended', () => {
				this.onAudioEnded();
			});

			this.$audio.addEventListener('play', () => {
				this.updateButtonIcon(true);
			});

			this.$audio.addEventListener('pause', () => {
				this.updateButtonIcon(false);
			});
		}

		// Wire button clicks
		if (this.$playPauseBtn) {
			this.$playPauseBtn.addEventListener('click', () => this.togglePlayPause());
		}
		if (this.$restartBtn) {
			this.$restartBtn.addEventListener('click', () => this.restart());
		}

		// Make progress bar clickable to seek
		if (this.$progress) {
			this.$progress.addEventListener('click', (e) => this.seek(e));
		}

		// Initial button state
		this.updateButtonIcon(false);
	}

	async getTemplate() {
		// Build SIcon components for play and pause
		this.playIcon = await window.slice.build('SIcon', {
			name: 'play',
			class: '',
		});

		this.pauseIcon = await window.slice.build('SIcon', {
			name: 'pause',
			class: '',
		});

		// Build single play/pause toggle button
		this.$playPauseBtn = await window.slice.build('SButton', {
			content: this.playIcon,
			size: 'icon',
			class: 'ap-play-pause',
		});

		const restartIcon = await window.slice.build('SIcon', {
			name: 'stop',
			class: '',
		});

		this.$restartBtn = await window.slice.build('SButton', {
			content: restartIcon,
			size: 'icon',
			class: 'ap-restart',
		});

		// Conditionally render progress bar or just time display
		const timeDisplay = this.props.compact
			? html`
				<div class="flex items-center gap-1">
					<span class="ap-current-time text-xs text-font-secondary">0:00</span>
					<span class="text-xs text-font-secondary">/</span>
					<span class="ap-duration text-xs text-font-secondary">0:00</span>
				</div>
			`
			: html`
				<div class="flex-1 flex items-center gap-2">
					<span class="ap-current-time text-xs text-font-secondary w-10">0:00</span>
					<div class="ap-progress flex-1 h-1 bg-gray-200 rounded-full cursor-pointer relative">
						<div class="ap-progress-bar h-full bg-primary rounded-full" style="width: 0%"></div>
					</div>
					<span class="ap-duration text-xs text-font-secondary w-10">0:00</span>
				</div>
			`;

		return html`
			<div class="audioplayer flex items-center gap-3 p-3 bg-white rounded-md ">
				<audio class="ap-audio hidden" src="${this.props.audioUrl}" preload="metadata"></audio>
				
				<div class="flex items-center gap-1">
					${this.$playPauseBtn}
					${this.$restartBtn}
				</div>

				${timeDisplay}
			</div>
		`;
	}

	play() {
		if (this.$audio) {
			this.$audio.play().catch(err => console.error('Play error:', err));
		}
	}

	pause() {
		if (this.$audio) {
			this.$audio.pause();
		}
	}

	restart() {
		if (this.$audio) {
			this.$audio.currentTime = 0;
			this.$audio.play().catch(err => console.error('Play error:', err));
		}
	}

	seek(e: MouseEvent) {
		if (!this.$audio || !this.$progress) return;

		const rect = this.$progress.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const percent = x / rect.width;
		this.$audio.currentTime = percent * this.$audio.duration;
	}

	togglePlayPause() {
		if (!this.$audio) return;

		if (this.$audio.paused) {
			this.play();
			this.updateButtonIcon(true);
		} else {
			this.pause();
			this.updateButtonIcon(false);
		}
	}

	updateButtonIcon(isPlaying: boolean) {
		if (!this.$playPauseBtn || !this.playIcon || !this.pauseIcon) return;
		// Use the content setter from SButton
		(this.$playPauseBtn).content = isPlaying ? this.pauseIcon : this.playIcon;
	}

	updateProgress() {
		if (!this.$audio || !this.$progressBar || !this.$currentTime) return;

		const percent = (this.$audio.currentTime / this.$audio.duration) * 100;
		this.$progressBar.style.width = `${percent}%`;
		this.$currentTime.textContent = this.formatTime(this.$audio.currentTime);
	}

	updateDuration() {
		if (!this.$audio || !this.$duration) return;
		this.$duration.textContent = this.formatTime(this.$audio.duration);
	}

	formatTime(seconds: number): string {
		if (isNaN(seconds)) return '0:00';
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	onAudioEnded() {
		this.updateButtonIcon(false);
		if (this.props.onEnded) {
			this.props.onEnded();
		}
	}

	update() {
		// Update audio source if audioUrl changes
		if (this.$audio && this.props.audioUrl) {
			this.$audio.src = this.props.audioUrl;
		}
	}

	disconnectedCallback() {
		// Pause and cleanup
		if (this.$audio) {
			this.$audio.pause();
			this.$audio.src = '';
		}
	}
}

customElements.define('slice-audioplayer', AudioPlayer);
