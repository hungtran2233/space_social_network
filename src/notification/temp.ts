// // =================== LOGIC LƯU DATABASE  ==========================
// // 1/ Bảng "notification" -- Gửi thông báo cho tất cả user đang theo dõi  - Lưu vào database
// // Map data
// const allDataNotification = allUserFollowing.map((item) => {
//     const data = {
//         event_id: 1,
//         target_user_id: item.follower_id,
//         is_read: false,
//     };
//     return data;
// });
// // Thực hiện lưu xuống database
// const createdNotifications = await Promise.all(
//     allDataNotification.map((data) =>
//         this.prisma.notification.create({ data }),
//     ),
// );

// // 2/ Bảng "notification_post_user" -- Gửi thông báo cho tất cả user đang theo dõi  - Lưu vào database
// // Map data
// const allDataNotificationPostUser = createdNotifications.map((item) => {
//     const data = {
//         notification_id: item.notification_id,
//         source_user_id: createNotificationDto.myId,
//         source_post_id: createNotificationDto.postId,
//     };
//     return data;
// });
// // Thực hiện lưu xuống database
// const createdNotificationPostUser = await Promise.all(
//     allDataNotificationPostUser.map((data) =>
//         this.prisma.notification_post_user.create({ data }),
//     ),
// );
