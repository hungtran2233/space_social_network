import { ConfigService } from '@nestjs/config';

// convert to second
function convertToSeconds(timeString: string): number {
    const value = parseInt(timeString);
    const unit = timeString.slice(-1);

    let seconds = 0;
    if (unit === 'm') {
        seconds = value * 60;
    } else if (unit === 'h') {
        seconds = value * 60 * 60;
    } else if (unit === 'd') {
        seconds = value * 24 * 60 * 60;
    }

    return seconds;
}

const getTimeExpiresByToken = (): any => {
    const config = new ConfigService();
    let tokenTime = config.get('TOKEN_TIME');

    let timestamp = Math.floor(Date.now() / 1000);

    // Chuyển qua múi giờ việt nam là +7, cộng với thời gian tồn tại của token
    let date = new Date(
        (timestamp + convertToSeconds(tokenTime) + 7 * 60 * 60) * 1000,
    );
    let datetime = date.toISOString();

    return datetime;
};

const getTimeLogout = (): any => {
    let timestamp = Math.floor(Date.now() / 1000);
    // Chuyển qua múi giờ việt nam là +7, cộng với thời gian tồn tại của token
    let date = new Date((timestamp + 7 * 60 * 60) * 1000);
    return date.toISOString();
};

export { getTimeExpiresByToken, getTimeLogout };
