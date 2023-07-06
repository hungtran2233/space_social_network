export class CreateLikeDto {}

// Post like
export class CreatePostLikeDto {
    post_id: number;
}

export class CountPostLikeDto {
    post_id: number;
}

// Image like
export class CreateImageLikeDto {
    image_id: number;
}

export class CountImageLikeDto {
    image_id: number;
}

// Comment like
export class CreateCommentLikeDto {
    comment_id: number;
}

export class CountCommentLikeDto {
    comment_id: number;
}
