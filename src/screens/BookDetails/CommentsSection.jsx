import React, { useState } from 'react';
import { 
  Box, Paper, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, 
  TextField, Button, Divider, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions 
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonIcon from '@mui/icons-material/Person';

const CommentsSection = ({ 
  comments, mainColor, currentUserId, editingCommentId, setEditingCommentId,
  activeEditText, setActiveEditText, replyingToId, setReplyingToId, activeReplyText, setActiveReplyText,
  handleDeleteComment, handleUpdateComment, handleAddReply 
}) => {

  // 🏪 حالات التحكم في نافذة التأكيد قبل الحذف
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [commentToDeleteId, setCommentToDeleteId] = useState(null);

  // 🛠️ دالة لفتح نافذة التأكيد وتحديد التعليق المستهدف
  const handleOpenDeleteDialog = (id) => {
    setCommentToDeleteId(id);
    setOpenDeleteDialog(true);
  };

  // 🛠️ دالة لإغلاق النافذة
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setCommentToDeleteId(null);
  };

  // 🛠️ دالة تأكيد الحذف النهائي
  const handleConfirmDelete = () => {
    if (commentToDeleteId) {
      handleDeleteComment(commentToDeleteId); 
    }
    handleCloseDeleteDialog();
  };

  // 🔍 فحص هل المستخدم مسجل دخول أم لا
  const isLoggedIn = Boolean(localStorage.getItem('user_id'));

  const currentLoggedInName = localStorage.getItem('user_name') || ""; 
  const storageUserId = localStorage.getItem('user_id');
  const loggedInId = currentUserId ? String(currentUserId).trim() : (storageUserId ? String(storageUserId).trim() : null);
  const cleanLoggedInName = currentLoggedInName ? currentLoggedInName.trim().toLowerCase() : "";

  // 🔒 إذا لم يسجل دخول، لن يتم عرض أي تعليق وسنعرض هذه اللوحة التنبيهية بدلاً منها
  if (!isLoggedIn) {
    return (
      <Paper elevation={0} sx={{ p: 4, borderRadius: '20px', border: '3px dashed #602134', bgcolor: '#f4f1ea', textAlign: 'center' }}>
        <LockOutlinedIcon sx={{ fontSize: '2.5rem', color: mainColor, mb: 1.5 }} />
        <Typography variant="subtitle1" sx={{ fontFamily: 'Cairo', fontWeight: 700, color: '#222', mb: 1 }}>
          مراجعات جُلساء المنصة مقفلة
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#666' }}>
          يرجى تسجيل الدخول أولاً لتتمكن من تصفح مراجعات القراء والرد عليها.
        </Typography>
      </Paper>
    );
  }

  // ✅ إذا مسجل دخول، يشتغل الكود الطبيعي بالأسفل بالكامل دون أي تغيير
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: '3px solid #602134', bgcolor: '#f4f1ea' }}>
      <Typography variant="subtitle2" sx={{ fontFamily: 'Cairo', fontWeight: 700, mb: 3, color: mainColor }}>
        مراجعات جُلساء المنصة ({comments.length})
      </Typography>

      {comments.length === 0 ? (
        <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#999', textAlign: 'center', py: 3 }}>
          لا توجد مراجعات بعد.
        </Typography>
      ) : (
        <List disablePadding>
          {comments.map((comment, index) => {
            const userName = comment.user?.name || currentLoggedInName || "مستخدم";
            const cleanCommentUserName = comment.user?.name ? comment.user.name.trim().toLowerCase() : "";
            const commentOwnerId = comment.user_id ? String(comment.user_id).trim() : (comment.user?.id ? String(comment.user.id).trim() : null);
            const isOwner = (commentOwnerId && loggedInId && commentOwnerId === loggedInId) || (cleanCommentUserName !== "" && cleanCommentUserName === cleanLoggedInName);

            // 🖼️ استخراج رابط الصورة وجعله يتجه إلى البورت 8000 الخاص بالسيرفر
            const commentUserImg = comment.user?.profile_img || comment.user?.avatar || comment.user?.image || "";
            const finalCommentImg = commentUserImg 
              ? (commentUserImg.startsWith('http') ? commentUserImg : `http://localhost:8000/storage/${commentUserImg}`)
              : "";

            return (
              <React.Fragment key={comment.id}>
                <ListItem alignItems="flex-start" disableGutters sx={{ py: 2, flexDirection: 'column' }}>
                  
                  {/* التعليق الرئيسي الأب */}
                  <Box sx={{ display: 'flex', width: '100%', position: 'relative' }}>
                    <ListItemAvatar sx={{ ml: 2, mr: 0, zIndex: 2 }}>
                      <Avatar 
                        src={finalCommentImg} 
                        sx={{ 
                          bgcolor: finalCommentImg ? mainColor : '#e0e0e0', 
                          color: '#ffffff', 
                          width: 44, 
                          height: 44 
                        }}
                      >
                        <PersonIcon sx={{ fontSize: '1.8rem' }} />
                      </Avatar>
                    </ListItemAvatar>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontFamily: 'Cairo', fontWeight: 700, color: '#222' }}>
                            {userName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#aaa', fontFamily: 'Cairo' }}>
                            {comment.created_at ? new Date(comment.created_at).toLocaleDateString('ar-EG') : 'الآن'}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box component="div" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%' }}>
                          <Typography variant="body2" component="div" sx={{ fontFamily: 'Cairo', color: '#444', lineHeight: 1.7, whiteSpace: 'pre-line', display: 'block' }}>
                            {comment.content}
                          </Typography>

                          {editingCommentId !== comment.id && (
                            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                              {isOwner && (
                                <>
                                  <Button size="small" sx={{ fontFamily: 'Cairo', minWidth: 0, p: 0, fontWeight: 700, color: mainColor }} 
                                    onClick={() => { setEditingCommentId(comment.id); setActiveEditText(comment.content); }}>
                                    تعديل
                                  </Button>
                                  <Button size="small" color="error" sx={{ fontFamily: 'Cairo', minWidth: 0, p: 0, fontWeight: 700 }} onClick={() => handleOpenDeleteDialog(comment.id)}>
                                    حذف
                                  </Button>
                                </>
                              )}
                              <Button size="small" color="secondary" sx={{ fontFamily: 'Cairo', minWidth: 0, p: 0 }}
                                onClick={() => { setReplyingToId(comment.id); setActiveReplyText(''); }}>
                                رد
                              </Button>
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  </Box>

                  {/* حاوية الردود الكبيرة */}
                  <Box 
                    sx={{ 
                      width: '100%', 
                      paddingRight: '44px', 
                      paddingLeft: '0px',
                      boxSizing: 'border-box',
                      position: 'relative',
                      mt: 1
                    }}
                  >
                    {/* صندوق إضافة رد على التعليق الرئيسي */}
                    {replyingToId === comment.id && (
                      <Box sx={{ width: '100%', mt: 1.5 }}>
                        <TextField
                          fullWidth multiline size="small" placeholder="اكتب رداً..."
                          value={activeReplyText} onChange={(e) => setActiveReplyText(e.target.value)}
                          sx={{ mb: 1, '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#f9f9f9' } }}
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button size="small" variant="contained" sx={{ bgcolor: mainColor, fontFamily: 'Cairo' }} onClick={() => handleAddReply(comment.id, activeReplyText)}>رد</Button>
                          <Button size="small" variant="outlined" color="inherit" sx={{ fontFamily: 'Cairo' }} onClick={() => setReplyingToId(null)}>إلغاء</Button>
                        </Box>
                      </Box>
                    )}

                    {/* عرض الردود */}
                    {comment.replies && comment.replies.length > 0 && (
                      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1 }}>
                        {comment.replies.map((reply, replyIndex) => {
                          const replyUser = reply.user?.name || "مستخدم";
                          const cleanReplyUserName = reply.user?.name ? reply.user.name.trim().toLowerCase() : "";
                          const replyOwnerId = reply.user_id ? String(reply.user_id).trim() : (reply.user?.id ? String(reply.user.id).trim() : null);
                          const isReplyOwner = (replyOwnerId && loggedInId && replyOwnerId === loggedInId) || (cleanReplyUserName !== "" && cleanCommentUserName === cleanLoggedInName);

                          // يجعل إزاحة الردود ثابتة كمستوى ثانٍ متناسق
                          const isSecondLevel = true;

                          const replyUserImg = reply.user?.profile_img || reply.user?.avatar || reply.user?.image || "";
                          const finalReplyImg = replyUserImg 
                            ? (replyUserImg.startsWith('http') ? replyUserImg : `http://localhost:8000/storage/${replyUserImg}`)
                            : "";

                          return (
                            <Box key={reply.id} sx={{ width: '100%', position: 'relative' }}>
                              
                              <Box 
                                sx={{ 
                                  display: 'flex', 
                                  bgcolor: '#E4DED2', 
                                  p: 1.5, 
                                  borderRadius: '12px', 
                                  flexDirection: 'column',
                                  position: 'relative',
                                  marginRight: isSecondLevel ? '32px' : '0px',
                                  boxSizing: 'border-box',
                                  zIndex: 2, 
                                }}
                              >
                                <Box sx={{ display: 'flex' }}>
                                  <ListItemAvatar sx={{ ml: 1.5, mr: 0, minWidth: 'auto', zIndex: 3 }}>
                                    <Avatar 
                                      src={finalReplyImg} 
                                      sx={{ 
                                        bgcolor: finalReplyImg ? '#9c27b0' : '#e0e0e0', 
                                        color: '#ffffff',
                                        width: 32, 
                                        height: 32 
                                      }}
                                    >
                                      <PersonIcon sx={{ fontSize: '1.3rem' }} />
                                    </Avatar>
                                  </ListItemAvatar>
                                  
                                  <Box sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <Typography variant="caption" sx={{ fontFamily: 'Cairo', fontWeight: 700 }}>{replyUser}</Typography>
                                      <Typography variant="caption" sx={{ color: '#aaa' }}>
                                        {reply.created_at ? new Date(reply.created_at).toLocaleDateString('ar-EG') : 'الآن'}
                                      </Typography>
                                    </Box>

                                    {editingCommentId === reply.id ? (
                                      <Box sx={{ mt: 1, width: '100%' }}>
                                        <TextField
                                          fullWidth multiline size="small" value={activeEditText}
                                          onChange={(e) => setActiveEditText(e.target.value)}
                                          sx={{ mb: 1, '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#fff' } }}
                                        />
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                          <Button size="small" variant="contained" sx={{ bgcolor: mainColor, fontFamily: 'Cairo' }} onClick={() => handleUpdateComment(reply.id, activeEditText)}>حفظ</Button>
                                          <Button size="small" variant="outlined" color="inherit" sx={{ fontFamily: 'Cairo' }} onClick={() => setEditingCommentId(null)}>إلغاء</Button>
                                        </Box>
                                      </Box>
                                    ) : (
                                      <Typography variant="body2" component="div" sx={{ fontFamily: 'Cairo', mt: 0.5, color: '#555', display: 'block' }}>
                                        {reply.content}
                                      </Typography>
                                    )}
                                    
                                    {editingCommentId !== reply.id && (
                                      <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                                        {isReplyOwner && (
                                          <>
                                            <Button size="small" sx={{ fontFamily: 'Cairo', fontSize: '0.75rem', minWidth: 0, p: 0, fontWeight: 700, color: mainColor }}
                                              onClick={() => { setEditingCommentId(reply.id); setActiveEditText(reply.content); }}>
                                              تعديل
                                            </Button>
                                            <Button size="small" color="error" sx={{ fontFamily: 'Cairo', fontSize: '0.75rem', minWidth: 0, p: 0, fontWeight: 700 }} onClick={() => handleOpenDeleteDialog(reply.id)}>
                                              حذف
                                            </Button>
                                          </>
                                        )}
                                        {/* 🌟 تم تثبيت كتابة الـ @ هنا بناءً على طلبك 🌟 */}
                                        <Button size="small" color="secondary" sx={{ fontFamily: 'Cairo', fontSize: '0.75rem', minWidth: 0, p: 0 }}
                                          onClick={() => { 
                                            setReplyingToId(reply.id); 
                                            setActiveReplyText(`@${replyUser} `); 
                                          }}>
                                          رد
                                        </Button>
                                      </Box>
                                    )}
                                  </Box>
                                </Box>

                                {/* صندوق الرد الفرعي */}
                                {replyingToId === reply.id && (
                                  <Box sx={{ width: '100%', mt: 1.5, boxSizing: 'border-box' }}>
                                    <TextField
                                      fullWidth multiline size="small" placeholder={`رد على ${replyUser}...`}
                                      value={activeReplyText} onChange={(e) => setActiveReplyText(e.target.value)}
                                      sx={{ mb: 1, '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#fff' } }}
                                    />
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                      <Button size="small" variant="contained" sx={{ bgcolor: mainColor, fontFamily: 'Cairo' }} onClick={() => handleAddReply(comment.id, activeReplyText)}>رد</Button>
                                      <Button size="small" variant="outlined" color="inherit" sx={{ fontFamily: 'Cairo' }} onClick={() => setReplyingToId(null)}>إلغاء</Button>
                                    </Box>
                                  </Box>
                                )}
                              </Box>

                            </Box>
                          );
                        })}
                      </Box>
                    )}
                  </Box>

                </ListItem>
                {index < comments.length - 1 && <Divider component="li" sx={{ opacity: 0.6 }} />}
              </React.Fragment>
            );
          })}
        </List>
      )}

      {/* نافذة التأكيد الأنيقة المضافة بدلاً من الـ Alert */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        PaperProps={{
          sx: { borderRadius: '15px', padding: '10px', direction: 'rtl' }
        }}
      >
        <DialogTitle sx={{ fontFamily: 'Cairo', fontWeight: 700, color: '#222' }}>
          تأكيد الحذف
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontFamily: 'Cairo', color: '#666' }}>
            هل أنت متأكد من رغبتك في حذف هذا التعليق؟ لا يمكن التراجع عن هذا الإجراء.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ gap: 1, px: 3, pb: 2 }}>
          <Button onClick={handleConfirmDelete} variant="contained" color="error" sx={{ fontFamily: 'Cairo', borderRadius: '8px' }}>
            حذف
          </Button>
          <Button onClick={handleCloseDeleteDialog} variant="outlined" color="inherit" sx={{ fontFamily: 'Cairo', borderRadius: '8px' }}>
            إلغاء
          </Button>
        </DialogActions>
      </Dialog>

    </Paper>
  );
};

export default CommentsSection;