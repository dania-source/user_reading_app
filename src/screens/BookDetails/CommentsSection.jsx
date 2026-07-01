import React, { useState } from 'react';
import { 
  Box, Paper, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, 
  TextField, Button, Divider, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Collapse
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonIcon from '@mui/icons-material/Person';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

// 🌿 مكون فرعي لعرض الردود بشكل شجري متداخل ومخفي تلقائياً ومحاذاته لليمين
const ReplyNode = ({ 
  reply, mainColor, loggedInId, cleanLoggedInName, editingCommentId, setEditingCommentId,
  activeEditText, setActiveEditText, replyingToId, setReplyingToId, activeReplyText, setActiveReplyText,
  handleOpenDeleteDialog, handleUpdateComment, handleAddReply, commentId 
}) => {
  // 👁️ حالة التحكم في إظهار/إخفاء الردود داخل هذا الرد (مغلق تلقائياً)
  const [showNestedReplies, setShowNestedReplies] = useState(false);

  const replyUser = reply.user?.name || "مستخدم";
  const cleanReplyUserName = reply.user?.name ? reply.user.name.trim().toLowerCase() : "";
  const replyOwnerId = reply.user_id ? String(reply.user_id).trim() : (reply.user?.id ? String(reply.user.id).trim() : null);
  const isReplyOwner = (replyOwnerId && loggedInId && replyOwnerId === loggedInId) || (cleanReplyUserName !== "" && cleanReplyUserName === cleanLoggedInName);

  const replyUserImg = reply.user?.profile_img || reply.user?.avatar || reply.user?.image || "";
  const finalReplyImg = replyUserImg 
    ? (replyUserImg.startsWith('http') ? replyUserImg : `http://localhost:8000/storage/${replyUserImg}`)
    : "";

  const hasReplies = reply.replies && reply.replies.length > 0;

  return (
    <Box sx={{ width: '100%', mt: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', direction: 'rtl' }}>
      <Box 
        sx={{ 
          display: 'flex', 
          bgcolor: '#E4DED2', 
          p: 1.5, 
          borderRadius: '12px', 
          flexDirection: 'column',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <Box sx={{ display: 'flex', width: '100%', direction: 'rtl' }}>
          <ListItemAvatar sx={{ ml: 1.5, mr: 0, minWidth: 'auto' }}>
            <Avatar src={finalReplyImg} sx={{ bgcolor: '#e0e0e0', width: 32, height: 32 }}>
              <PersonIcon sx={{ fontSize: '1.3rem' }} />
            </Avatar>
          </ListItemAvatar>
          
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', direction: 'rtl' }}>
              <Typography variant="caption" sx={{ fontFamily: 'Cairo', fontWeight: 700, textAlign: 'right' }}>{replyUser}</Typography>
              <Typography variant="caption" sx={{ color: '#aaa', textAlign: 'left' }}>
                {reply.created_at ? new Date(reply.created_at).toLocaleDateString('ar-EG') : 'الآن'}
              </Typography>
            </Box>

            {editingCommentId === reply.id ? (
              <Box sx={{ mt: 1, width: '100%' }}>
                <TextField
                  fullWidth multiline size="small" value={activeEditText}
                  onChange={(e) => setActiveEditText(e.target.value)}
                  inputProps={{ style: { textAlign: 'right', direction: 'rtl' } }}
                  sx={{ mb: 1, '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#fff' } }}
                />
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-start' }}>
                  <Button size="small" variant="contained" sx={{ bgcolor: mainColor, fontFamily: 'Cairo' }} onClick={() => handleUpdateComment(reply.id, activeEditText)}>حفظ</Button>
                  <Button size="small" variant="outlined" color="inherit" sx={{ fontFamily: 'Cairo' }} onClick={() => setEditingCommentId(null)}>إلغاء</Button>
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" sx={{ fontFamily: 'Cairo', mt: 0.5, color: '#555', textAlign: 'right', width: '100%' }}>
                {reply.content}
              </Typography>
            )}
            
            {editingCommentId !== reply.id && (
              <Box sx={{ display: 'flex', gap: 2, mt: 0.5, justifyContent: 'flex-start' }}>
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

        {replyingToId === reply.id && (
          <Box sx={{ width: '100%', mt: 1.5 }}>
            <TextField
              fullWidth multiline size="small" placeholder={`رد على ${replyUser}...`}
              value={activeReplyText} onChange={(e) => setActiveReplyText(e.target.value)}
              inputProps={{ style: { textAlign: 'right', direction: 'rtl' } }}
              sx={{ mb: 1, '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#fff' } }}
            />
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-start' }}>
              <Button size="small" variant="contained" sx={{ bgcolor: mainColor, fontFamily: 'Cairo' }} onClick={() => handleAddReply(commentId, activeReplyText, reply.id)}>رد</Button>
              <Button size="small" variant="outlined" color="inherit" sx={{ fontFamily: 'Cairo' }} onClick={() => setReplyingToId(null)}>إلغاء</Button>
            </Box>
          </Box>
        )}
      </Box>

      {/* 🔘 زر إظهار/إخفاء الردود الفرعية للرد الحالي */}
      {hasReplies && (
        <Button
          size="small"
          startIcon={showNestedReplies ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          onClick={() => setShowNestedReplies(!showNestedReplies)}
          sx={{ fontFamily: 'Cairo', fontSize: '0.75rem', mt: 0.5, color: '#666', textTransform: 'none', alignSelf: 'flex-start' }}
        >
          {showNestedReplies ? "إخفاء الردود" : `عرض الردود (${reply.replies.length})`}
        </Button>
      )}

      {/* 🔄 عرض الردود المتداخلة مع إزاحة جهة اليمين وخط ربط جانبي */}
      {hasReplies && (
        <Collapse in={showNestedReplies} sx={{ width: '100%' }}>
          <Box 
            sx={{ 
              width: '100%',
              pl: 0, 
              pr: 2, 
              borderRight: '2px solid #ccc', 
              mr: 1.5, 
              ml: 0,
              mt: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            }}
          >
            {reply.replies.map((nestedReply) => (
              <ReplyNode
                key={nestedReply.id}
                reply={nestedReply}
                mainColor={mainColor}
                loggedInId={loggedInId}
                cleanLoggedInName={cleanLoggedInName}
                editingCommentId={editingCommentId}
                setEditingCommentId={setEditingCommentId}
                activeEditText={activeEditText}
                setActiveEditText={setActiveEditText}
                replyingToId={replyingToId}
                setReplyingToId={setReplyingToId}
                activeReplyText={activeReplyText}
                setActiveReplyText={setActiveReplyText}
                handleOpenDeleteDialog={handleOpenDeleteDialog}
                handleUpdateComment={handleUpdateComment}
                handleAddReply={handleAddReply}
                commentId={commentId}
              />
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

const CommentsSection = ({ 
  comments, mainColor, currentUserId, editingCommentId, setEditingCommentId,
  activeEditText, setActiveEditText, replyingToId, setReplyingToId, activeReplyText, setActiveReplyText,
  handleDeleteComment, handleUpdateComment, handleAddReply 
}) => {

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [commentToDeleteId, setCommentToDeleteId] = useState(null);

  // 👁️ حالة للاحتفاظ بالتعليقات المفتوحة (تعتمد على الـ ID الخاص بكل تعليق)
  const [expandedComments, setExpandedComments] = useState({});

  const toggleCommentReplies = (id) => {
    setExpandedComments(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleOpenDeleteDialog = (id) => {
    setCommentToDeleteId(id);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setCommentToDeleteId(null);
  };

  const handleConfirmDelete = () => {
    if (commentToDeleteId) {
      handleDeleteComment(commentToDeleteId); 
    }
    handleCloseDeleteDialog();
  };

  const isLoggedIn = Boolean(localStorage.getItem('token'));
  const currentLoggedInName = localStorage.getItem('user_name') || ""; 
  const storageUserId = localStorage.getItem('user_id');
  const loggedInId = currentUserId ? String(currentUserId).trim() : (storageUserId ? String(storageUserId).trim() : null);
  const cleanLoggedInName = currentLoggedInName ? currentLoggedInName.trim().toLowerCase() : "";

  if (!isLoggedIn) {
    return (
      <Paper Paper elevation={0} sx={{ p: 4, borderRadius: '20px', border: '3px dashed #602134', bgcolor: '#f4f1ea', textAlign: 'center', direction: 'rtl' }}>
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

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: '3px solid #602134', bgcolor: '#f4f1ea', direction: 'rtl' }}>
      <Typography variant="h6" sx={{ fontFamily: 'Cairo', fontWeight: 700, mb: 3, color: mainColor, textAlign: 'right' }}>
        مراجعات جُلساء المنصة ({comments.length})
      </Typography>

      {comments.length === 0 ? (
        <Typography variant="body2" sx={{ fontFamily: 'Cairo', color: '#999', textAlign: 'center', py: 4 }}>
          لا توجد مراجعات لهذا الكتاب بعد. كن أول من يشارك رأيه!
        </Typography>
      ) : (
        <List sx={{ width: '100%', p: 0 }}>
          {comments.map((comment) => {
            const commentUser = comment.user?.name || "جليس مجهول";
            const cleanCommentUserName = comment.user?.name ? comment.user.name.trim().toLowerCase() : "";
            const commentOwnerId = comment.user_id ? String(comment.user_id).trim() : (comment.user?.id ? String(comment.user.id).trim() : null);
            const isCommentOwner = (commentOwnerId && loggedInId && commentOwnerId === loggedInId) || (cleanCommentUserName !== "" && cleanCommentUserName === cleanLoggedInName);

            const commentUserImg = comment.user?.profile_img || comment.user?.avatar || "";
            const finalCommentImg = commentUserImg 
              ? (commentUserImg.startsWith('http') ? commentUserImg : `http://localhost:8000/storage/${commentUserImg}`)
              : "";

            const hasReplies = comment.replies && comment.replies.length > 0;
            const isExpanded = expandedComments[comment.id] || false;

            return (
              <Box key={comment.id} sx={{ mb: 3 }}>
                <ListItem alignItems="flex-start" sx={{ p: 0, mb: 1, direction: 'rtl' }}>
                  <ListItemAvatar sx={{ ml: 2, mr: 0 }}>
                    <Avatar src={finalCommentImg} sx={{ width: 50, 
            height: 50, 
            border: `2px solid ${mainColor}`,
            bgcolor: '#BDBDBD', }}>
                        <PersonIcon sx={{ fontSize: 35, color: '#ffffff' }} />
              
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', direction: 'rtl' }}>
                        <Typography variant="subtitle2" sx={{ fontFamily: 'Cairo', fontWeight: 700, color: '#333', textAlign: 'right' }}>
                          {commentUser}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#aaa', textAlign: 'left' }}>
                          {comment.created_at ? new Date(comment.created_at).toLocaleDateString('ar-EG') : 'الآن'}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        {editingCommentId === comment.id ? (
                          <Box sx={{ mt: 1, width: '100%' }}>
                            <TextField
                              fullWidth multiline size="small" value={activeEditText}
                              onChange={(e) => setActiveEditText(e.target.value)}
                              inputProps={{ style: { textAlign: 'right', direction: 'rtl' } }}
                              sx={{ mb: 1, '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#fff' } }}
                            />
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-start' }}>
                              <Button size="small" variant="contained" sx={{ bgcolor: mainColor, fontFamily: 'Cairo' }} onClick={() => handleUpdateComment(comment.id, activeEditText)}>حفظ</Button>
                              <Button size="small" variant="outlined" color="inherit" sx={{ fontFamily: 'Cairo' }} onClick={() => setEditingCommentId(null)}>إلغاء</Button>
                            </Box>
                          </Box>
                        ) : (
                          <Typography variant="body1" sx={{ fontFamily: 'Cairo', color: '#444', lineHeight: 1.6, textAlign: 'right', width: '100%' }}>
                            {comment.content}
                          </Typography>
                        )}

                        {editingCommentId !== comment.id && (
                          <Box sx={{ display: 'flex', gap: 2, mt: 1, justifyContent: 'flex-start' }}>
                            {isCommentOwner && (
                              <>
                                <Button size="small" sx={{ fontFamily: 'Cairo', fontSize: '0.85rem', p: 0, minWidth: 0, color: mainColor, fontWeight: 700 }}
                                  onClick={() => { setEditingCommentId(comment.id); setActiveEditText(comment.content); }}>
                                  تعديل
                                </Button>
                                <Button size="small" color="error" sx={{ fontFamily: 'Cairo', fontSize: '0.85rem', p: 0, minWidth: 0, fontWeight: 700 }} onClick={() => handleOpenDeleteDialog(comment.id)}>
                                  حذف
                                </Button>
                              </>
                            )}
                            <Button size="small" color="secondary" sx={{ fontFamily: 'Cairo', fontSize: '0.85rem', p: 0, minWidth: 0 }}
                              onClick={() => { 
                                setReplyingToId(comment.id); 
                                setActiveReplyText(''); 
                                if(!isExpanded) toggleCommentReplies(comment.id);
                              }}>
                              رد
                            </Button>
                          </Box>
                        )}
                      </Box>
                    }
                  />
                </ListItem>

                {replyingToId === comment.id && (
                  <Box sx={{ mr: 7, ml: 0, mb: 2, mt: 1 }}>
                    <TextField
                      fullWidth multiline size="small" placeholder="اكتب رداً..."
                      value={activeReplyText} onChange={(e) => setActiveReplyText(e.target.value)}
                      inputProps={{ style: { textAlign: 'right', direction: 'rtl' } }}
                      sx={{ mb: 1, '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#fff' } }}
                    />
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-start' }}>
                      <Button size="small" variant="contained" sx={{ bgcolor: mainColor, fontFamily: 'Cairo' }} onClick={() => handleAddReply(comment.id, activeReplyText)}>رد</Button>
                      <Button size="small" variant="outlined" color="inherit" sx={{ fontFamily: 'Cairo' }} onClick={() => setReplyingToId(null)}>إلغاء</Button>
                    </Box>
                  </Box>
                )}

                {/* 🔘 زر يوتيوب/فيسبوك لعرض الردود التابعة للتعليق الرئيسي */}
                {hasReplies && (
                  <Box sx={{ mr: 7, ml: 0, mt: 0.5, display: 'flex', justifyContent: 'flex-start' }}>
                    <Button
                      size="small"
                      startIcon={isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                      onClick={() => toggleCommentReplies(comment.id)}
                      sx={{ fontFamily: 'Cairo', fontWeight: 700, color: mainColor, textTransform: 'none' }}
                    >
                      {isExpanded ? "إخفاء الردود" : `عرض الردود (${comment.replies.length})`}
                    </Button>
                  </Box>
                )}

                {/* 🔄 عرض الردود عند الفتح بإزاحة يمين صحيحة وبخط ربط جانبي أيمن */}
                {hasReplies && (
                  <Collapse in={isExpanded}>
                    <Box sx={{ mr: 7, ml: 0, mt: 1, display: 'flex', flexDirection: 'column', gap: 1.5, borderRight: '2px solid #E4DED2', borderLeft: 'none', pr: 2, pl: 0 }}>
                      {comment.replies.map((reply) => (
                        <ReplyNode
                          key={reply.id}
                          reply={reply}
                          commentId={comment.id}
                          mainColor={mainColor}
                          loggedInId={loggedInId}
                          cleanLoggedInName={cleanLoggedInName}
                          editingCommentId={editingCommentId}
                          setEditingCommentId={setEditingCommentId}
                          activeEditText={activeEditText}
                          setActiveEditText={setActiveEditText}
                          replyingToId={replyingToId}
                          setReplyingToId={setReplyingToId}
                          activeReplyText={activeReplyText}
                          setActiveReplyText={setActiveReplyText}
                          handleOpenDeleteDialog={handleOpenDeleteDialog}
                          handleUpdateComment={handleUpdateComment}
                          handleAddReply={handleAddReply}
                        />
                      ))}
                    </Box>
                  </Collapse>
                )}
                <Divider sx={{ my: 2, borderColor: '#E4DED2' }} />
              </Box>
            );
          })}
        </List>
      )}

      {/* نافذة تأكيد الحذف */}
{/* نافذة تأكيد الحذف المخصصة بثيم المنصة */}
<Dialog 
  open={openDeleteDialog} 
  onClose={handleCloseDeleteDialog} 
  dir="rtl"
  PaperProps={{
    sx: {
      borderRadius: '24px',          // حواف دائرية ناعمة جداً
      bgcolor: '#f4f1ea',            // اللون الكريمي لثيم الصفحة
      border: '3px solid #602134',   // إطار برغندي أنيق يحدد النافذة
      p: 1.5,
      maxWidth: '450px',
      width: '100%'
    }
  }}
>
  <DialogTitle 
    sx={{ 
      fontFamily: 'Cairo', 
      fontWeight: 800, 
      textAlign: 'right',
      color: '#602134',              // عنوان برغندي عريض
      fontSize: '1.3rem',
      pb: 1
    }}
  >
    تأكيد حذف المراجعة
  </DialogTitle>
  
  <DialogContent>
    <DialogContentText 
      sx={{ 
        fontFamily: 'Cairo', 
        textAlign: 'right',
        color: '#444', 
        fontSize: '0.95rem',
        lineHeight: 1.6
      }}
    >
      هل أنت متأكد من أنك تريد حذف هذه المراجعة أو الرد؟ هذا الإجراء سيقوم بإزالة المحتوى نهائياً ولا يمكن التراجع عنه.
    </DialogContentText>
  </DialogContent>
  
  <DialogActions 
    sx={{ 
      px: 3, 
      pb: 2, 
      gap: 1.5,
      justifyContent: 'flex-start' // محاذاة الأزرار لليمين بالتوافق مع الـ RTL
    }}
  >
    {/* زر الحذف باللون البرغندي */}
    <Button 
      onClick={handleConfirmDelete} 
      variant="contained" 
      sx={{ 
        fontFamily: 'Cairo',
        fontWeight: 700,
        bgcolor: '#602134',
        color: '#fff',
        borderRadius: '12px',
        px: 3,
        py: 0.8,
        boxShadow: 'none',
        '&:hover': {
          bgcolor: '#4a1928', // درجة أغمق عند الحوم (Hover)
          boxShadow: 'none'
        }
      }}
    >
      نعم، احذف
    </Button>

    {/* زر الإلغاء الشفاف */}
    <Button 
      onClick={handleCloseDeleteDialog} 
      variant="outlined"
      sx={{ 
        fontFamily: 'Cairo', 
        fontWeight: 700,
        color: '#602134',
        borderColor: '#602134',
        borderRadius: '12px',
        px: 3,
        py: 0.8,
        '&:hover': {
          borderColor: '#4a1928',
          bgcolor: 'rgba(96, 33, 52, 0.08)' // خلفية خفيفة جداً عند الحوم
        }
      }}
    >
      إلغاء
    </Button>
  </DialogActions>
</Dialog>
    </Paper>
  );
};

export default CommentsSection;